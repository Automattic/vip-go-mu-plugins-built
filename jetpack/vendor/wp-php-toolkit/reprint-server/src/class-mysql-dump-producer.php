<?php

namespace WordPress\Reprint\Server;

require_once __DIR__ . '/utils.php';
require_once __DIR__ . "/class-database-rows-reader.php";

/**
 * Generates a MySQL dump as a sequence of SQL fragments, one per call to next_sql_fragment().
 *
 * This class exists because shared hosting environments kill long-running PHP processes.
 * A traditional mysqldump would time out on large databases. Instead, this producer
 * yields one SQL fragment at a time — a CREATE TABLE, a batched INSERT, or an UPDATE —
 * and exposes a JSON cursor after each emitted fragment. The caller can serialize that
 * cursor, end the HTTP request, and resume at the same SQL-fragment boundary in a later
 * request. The cursor records emitted SQL progress instead of fetched-but-unemitted rows.
 *
 * The producer is a finite state machine that walks through tables sequentially:
 *
 *   INIT → EMIT_HEADER → NEXT_TABLE → CREATE_TABLE → TABLE_HEADER →
 *   START_INSERT ⇄ EMIT_ROW → (EMIT_OVERSIZED_UPDATE) → … → EMIT_FOOTER → FINISHED
 *
 * All values are base64-encoded in the SQL output (via FROM_BASE64('...')). This avoids
 * charset-related corruption: MySQL interprets string literals according to the
 * connection charset, but base64 is pure ASCII and the decoded bytes are assigned
 * directly to the column's declared charset. JSON columns are a special case — MySQL
 * rejects binary charset input for JSON, so those get an extra CONVERT(... USING utf8mb4).
 *
 * For keyed rows, eligible large columns can be inserted as empty strings and then
 * filled via UPDATE ... SET col = CONCAT(col, chunk) statements.
 *
 * Known limitations:
 *
 * - Rows too large to be SELECTed. If a row is larger than max_allowed_packet or the
 *   PHP memory_limit, it won't be exported. The underlying assumption is that WordPress
 *   wouldn't be able to use that data anyway. If that turns out to be wrong, and there
 *   are plugins that use huge blobs with byte offset queries, we'll need to add measures
 *   to detect those situations and export that data in chunks.
 * - Tables without a primary key can't use the oversized row handling as there's no
 *   stable row identifier for the UPDATE ... SET col = CONCAT(col, chunk) WHERE ... query.
 */
class MySQLDumpProducer
{
    /**
     * Maximum decoded SQL body bytes for one multipart part.
     *
     * The producer closes a multi-row INSERT at this limit, or splits or
     * rejects one oversized row fragment. The exporter uses the same limit to
     * stop grouping fragments before the complete multipart part becomes
     * oversized, then checks its final byte length before writing it.
     */
    public const MAX_SQL_PART_BODY_BYTES = 16 * 1024 * 1024;

    const STATE_INIT = "init";
    const STATE_EMIT_HEADER = "emit_header";
    const STATE_NEXT_TABLE = "next_table";
    const STATE_CREATE_TABLE = "create_table";
    const STATE_TABLE_HEADER = "table_header";
    const STATE_START_INSERT = "start_insert";
    const STATE_EMIT_ROW = "emit_row";
    const STATE_EMIT_OVERSIZED_UPDATE = "emit_oversized_update";
    const STATE_EMIT_FOOTER = "emit_footer";
    const STATE_FINISHED = "finished";

    /** @var mixed PDO or a PDO-compatible adapter. */
    private $db;

    /** @var DatabaseRowsReader */
    private $row_reader;

    /** @var string|null */
    private $current_sql_fragment = null;

    /** @var bool */
    private $current_fragment_must_be_its_own_part = false;

    /** @var string */
    private $state = self::STATE_INIT;

    /** @var int */
    private $rows_in_batch = 0;

    /** @var bool */
    private $emit_create_table;

    /**
     * Derived from MySQL's max_allowed_packet (at 80% to leave headroom for
     * protocol framing). Rows whose formatted SQL exceeds this limit are split
     * into an INSERT with empty placeholders followed by UPDATE ... CONCAT()
     * statements that append the real data in chunks.
     *
     * @var int
     */
    private $max_statement_size;

    /**
     * When a row is too large for a single INSERT, its big columns are split
     * into chunks and queued here. Each entry tracks the column name, its
     * data type, the current byte offset into the value, and the total byte
     * length. Character columns also track a character offset because MySQL's
     * SUBSTRING() counts characters for those types. The actual data is
     * re-fetched from the database on demand, keeping cursors small (a few
     * hundred bytes rather than megabytes of raw data).
     *
     * @var array Array of {column: string, data_type: string, byte_offset: int, total_length: int, character_offset?: int}
     */
    private $oversized_queue = [];

    /** @var array|null */
    private $oversized_pk_values = null;

    /** @var int */
    private $current_statement_size = 0;

    /**
     * Reader cursor from before a fetched row which must begin the next INSERT.
     *
     * The live producer retains that row in memory. A serialized producer
     * cursor uses this earlier reader position so a new process fetches the
     * row again instead of skipping it.
     *
     * @var array|null
     */
    private $reader_cursor_before_retained_record = null;

    /**
     * @param object $db Database connection — either a real PDO (MySQL) or a
     *        PDO-compatible adapter (SQLite sites). No type hint because the
     *        adapter isn't a PDO subclass and PHP 7.4 lacks union types.
     */
    public function __construct($db, $options = [])
    {
        $this->db = $db;
        $this->row_reader = new DatabaseRowsReader($db, $options);
        $this->emit_create_table = (bool)($options["create_table_query"] ?? true);

        if (isset($options["max_statement_size"])) {
            $this->max_statement_size = (int)$options["max_statement_size"];
        } else {
            $this->max_statement_size = $this->detect_max_statement_size();
        }

        if (isset($options["cursor"])) {
            $this->initialize_from_cursor($options["cursor"]);
        }
    }

    public function get_sql_fragment(): ?string
    {
        return $this->current_sql_fragment;
    }

    public function is_finished(): bool
    {
        return self::STATE_FINISHED === $this->state;
    }

    /** Returns whether this fragment must be sent in its own multipart part. */
    public function current_fragment_must_be_its_own_part(): bool
    {
        return $this->current_fragment_must_be_its_own_part;
    }

    /**
     * Advances the state machine and populates the next SQL fragment.
     *
     * Call get_sql_fragment() after this returns true to retrieve the SQL.
     * Returns false only when the dump is complete (state = FINISHED).
     */
    public function next_sql_fragment()
    {
        if ($this->is_finished()) {
            return false;
        }

        $this->current_fragment_must_be_its_own_part = false;

        if (self::STATE_INIT === $this->state) {
            if (!$this->row_reader->has_initialized_tables()) {
                $this->row_reader->initialize_tables_to_process();
            }
            $this->state = self::STATE_EMIT_HEADER;
        }

        while (true) {
            switch ($this->state) {
                case self::STATE_EMIT_HEADER:
                    $this->emit_sql_header();
                    $this->state = self::STATE_NEXT_TABLE;
                    $this->current_fragment_must_be_its_own_part = true;
                    return true;

                case self::STATE_NEXT_TABLE:
                    if ($this->move_to_next_table()) {
                        $this->state = $this->emit_create_table
                            ? self::STATE_CREATE_TABLE
                            : self::STATE_TABLE_HEADER;
                    } else {
                        $this->state = self::STATE_EMIT_FOOTER;
                    }
                    break;

                case self::STATE_EMIT_FOOTER:
                    $this->emit_sql_footer();
                    $this->state = self::STATE_FINISHED;
                    $this->current_fragment_must_be_its_own_part = true;
                    return true;

                case self::STATE_CREATE_TABLE:
                    $this->emit_create_table_statement();
                    $this->state = self::STATE_TABLE_HEADER;
                    $this->current_fragment_must_be_its_own_part = true;
                    return true;

                case self::STATE_TABLE_HEADER:
                    $this->emit_table_header_comment();
                    $this->state = self::STATE_START_INSERT;
                    return true;

                case self::STATE_START_INSERT:
                    if ($this->emit_insert_header()) {
                        return true;
                    }
                    // Empty table — emit_insert_header set state to NEXT_TABLE
                    break;

                case self::STATE_EMIT_ROW:
                    return $this->emit_row();

                case self::STATE_EMIT_OVERSIZED_UPDATE:
                    if ($this->emit_oversized_update()) {
                        $this->current_fragment_must_be_its_own_part = true;
                        return true;
                    }
                    break;

                case self::STATE_FINISHED:
                    return false;
            }
        }

        return false;
    }
    /**
     * Emits "INSERT INTO ... VALUES (first_row)" as a single fragment.
     *
     * The first row is always bundled with the INSERT header to prevent
     * emitting a dangling "INSERT INTO ... VALUES" with no rows — which
     * would happen if the caller saves the cursor right after the header
     * and the data changes before the next request.
     */
    private function emit_insert_header()
    {
        $this->rows_in_batch = 0;
        if ($this->row_reader->get_current_record() === null) {
            if (!$this->row_reader->next_record()) {
                $this->state = self::STATE_NEXT_TABLE;
                return false;
            }
        }

        $column_list = implode(
            ",",
            array_map(function ($col) {
                return $this->row_reader->quote_identifier($col);
            }, $this->row_reader->get_current_column_names())
        );

        $header = "INSERT INTO " . $this->row_reader->quote_identifier($this->row_reader->get_current_table()) . " ({$column_list}) VALUES\n";
        $this->current_statement_size = strlen($header) + strlen($this->on_duplicate_key()) + 1;

        $current_record_ends_query_batch = $this->row_reader->is_current_record_at_query_batch_boundary();
        $first_row_sql = $this->format_row_for_insert(
            $this->row_reader->get_current_record(),
            $this->current_statement_size
        );
        $this->current_statement_size += strlen($first_row_sql);

        $this->row_reader->clear_current_record();
        $this->reader_cursor_before_retained_record = null;
        $this->rows_in_batch = 1;

        // Oversized updates require closing this INSERT with a semicolon so the
        // subsequent UPDATE statements are syntactically separate.
        $has_oversized = $this->has_pending_oversized_updates();

        if (
            $current_record_ends_query_batch ||
            $this->rows_in_batch >= $this->row_reader->get_batch_size()
        ) {
            $this->finish_insert_batch($header . $first_row_sql, $has_oversized);
            return true;
        }

        if ($has_oversized) {
            $sql = $header . $first_row_sql . $this->on_duplicate_key() . ';';
            $this->current_sql_fragment = $sql;
            $this->current_statement_size = 0;
            $this->state = self::STATE_EMIT_OVERSIZED_UPDATE;
        } else {
            $sql = $header . $first_row_sql;
            $this->current_sql_fragment = $sql;
            $this->state = self::STATE_EMIT_ROW;
        }

        return true;
    }

    /** Emits one row with a leading comma, or closes the open INSERT when no row remains. */
    private function emit_row()
    {
        $reader_cursor_before_current_record = $this->row_reader->get_cursor_state();
        if (!$this->row_reader->next_record()) {
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->state = self::STATE_NEXT_TABLE;
            return true;
        }

        $row_tuple_bytes = $this->estimate_formatted_row_tuple_bytes(
            $this->row_reader->get_current_record()
        );
        $maximum_insert_statement_bytes = min(
            $this->max_statement_size,
            self::MAX_SQL_PART_BODY_BYTES
        );
        if (
            $this->current_statement_size + 1 + $row_tuple_bytes >
                $maximum_insert_statement_bytes
        ) {
            // This row fits as the first row of another INSERT, but not in the
            // current one. Keep it in memory for the live producer. A resumed
            // producer uses the earlier cursor and fetches it again.
            $this->reader_cursor_before_retained_record = $reader_cursor_before_current_record;
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->state = self::STATE_START_INSERT;
            return true;
        }

        $current_record_ends_query_batch = $this->row_reader->is_current_record_at_query_batch_boundary();
        $row_sql = $this->format_row_for_insert(
            $this->row_reader->get_current_record(),
            strlen($this->on_duplicate_key()) + 1
        );
        $this->current_statement_size += strlen($row_sql) + 1;
        $this->row_reader->clear_current_record();
        $this->rows_in_batch++;

        $has_oversized = $this->has_pending_oversized_updates();

        if (
            $current_record_ends_query_batch ||
            $this->rows_in_batch >= $this->row_reader->get_batch_size()
        ) {
            $this->finish_insert_batch("," . $row_sql, $has_oversized);
            return true;
        }

        if ($has_oversized) {
            $this->current_sql_fragment = "," . $row_sql . $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->state = self::STATE_EMIT_OVERSIZED_UPDATE;
        } else {
            $this->current_sql_fragment = "," . $row_sql;
        }

        return true;
    }

    /** Finishes an INSERT batch at its bounded row limit. */
    private function finish_insert_batch($sql, $has_oversized)
    {
        $this->current_sql_fragment = $sql . $this->on_duplicate_key() . ';';
        $this->current_statement_size = 0;
        if ($has_oversized) {
            $this->state = self::STATE_EMIT_OVERSIZED_UPDATE;
        } else {
            $this->state = self::STATE_START_INSERT;
        }
    }

    /**
     * Returns a no-op update for rows already written by a stopped INSERT.
     *
     * MyISAM can keep a complete prefix of a multi-row INSERT when the query
     * stops. Repeating that INSERT should skip the existing rows and write the
     * missing rows. Assigning any inserted column to itself handles a simple
     * or composite key without hiding invalid values behind INSERT IGNORE.
     * MySQL can also detect an enforced UNIQUE key whose columns are NOT NULL.
     * A nullable UNIQUE key cannot identify an existing row because MySQL
     * permits more than one row whose unique-key value contains NULL.
     */
    private function on_duplicate_key()
    {
        $first_column = $this->row_reader->get_current_column_names()[0];
        $quoted_column = $this->row_reader->quote_identifier($first_column);
        return "\nON DUPLICATE KEY UPDATE {$quoted_column} = {$quoted_column}";
    }

    /**
     * Emits DROP TABLE IF EXISTS followed by the CREATE TABLE from SHOW CREATE TABLE.
     * Also handles views (SHOW CREATE TABLE returns 'Create View' for those).
     */
    private function emit_create_table_statement()
    {
        $quoted_table = $this->row_reader->quote_identifier($this->row_reader->get_current_table());
        try {
            $query = "SHOW CREATE TABLE {$quoted_table}";
            $result = $this->db->query($query);
            $row = $result->fetch(PdoConstants::fetch_assoc());
        } catch (\Exception $e) {
            throw new \RuntimeException(
                "Failed to get CREATE TABLE for {$quoted_table}: " . $e->getMessage() . " Query: {$query}"
            );
        }

        $sql = null;
        if ($row) {
            if (isset($row["Create Table"])) {
                $sql = $row["Create Table"];
            } elseif (isset($row["Create View"])) {
                $sql = $row["Create View"];
            }
        }

        if ($sql) {
            // Prevent breaking the line by identifiers with a newline byte in them.
            $header = "--\n-- Table structure for table ".str_replace("\n",'\n',$quoted_table)."\n--\n\n";
            $drop = "DROP TABLE IF EXISTS {$quoted_table};\n";
            $this->current_sql_fragment = $header . $drop . $sql . ";";
        } else {
            $keys = $row ? implode(", ", array_keys($row)) : "(no row returned)";
            throw new \RuntimeException(
                "SHOW CREATE TABLE {$quoted_table} returned no usable SQL. " .
                "Available keys: {$keys}"
            );
        }
    }

    /**
     * Emits SET statements that configure constraint checks and set a strict SQL mode.
     * These are restored in emit_sql_footer(). Without disabling FK checks, tables
     * that reference each other would need to be imported in dependency order.
     * Unique checks stay enabled because replayed INSERT statements use unique
     * keys to recognize rows which are already present.
     *
     * The SQL_MODE explicitly omits NO_ZERO_DATE, NO_ZERO_IN_DATE, and NO_ENGINE_SUBSTITUTION.
     *
     * For dates, many WordPress databases contain zero dates like '0000-00-00'
     * or '0000-00-00 00:00:00' (e.g. in wp_posts.post_date for drafts). The
     * source server may have been running without those restrictions, and the
     * dump must be importable regardless of the target server's default sql_mode.
     *
     * From the MySQL 8.0 Reference Manual (§5.1.11 "Server SQL Modes"):
     *
     *   NO_ZERO_DATE — [...] The server requires dates to have nonzero month
     *   and day values. If NO_ZERO_DATE is enabled and strict mode is enabled,
     *   '0000-00-00' is not permitted and inserts produce an error. [...]
     *   If NO_ZERO_DATE is disabled, '0000-00-00' is permitted and inserts
     *   produce no warning.
     *
     *   NO_ZERO_IN_DATE — [...] Affects whether the server permits dates in
     *   which the year part is nonzero but the month or day part is 0.
     *   [...] If this mode is disabled, dates with zero parts are permitted
     *   and inserts produce no warning.
     *
     * By omitting both flags while keeping STRICT_TRANS_TABLES, the dump
     * preserves MySQL's permissive behavior toward zero dates during import.
     *
     * By omitting NO_ENGINE_SUBSTITUTION, we allow imports to succeed under stricter requirements.
     * Example: A MyISAM source table carries ENGINE=MyISAM into the dump, and the target
     * database uses enforce_storage_engine to InnoDB. With NO_ENGINE_SUBSTITUTION, the
     * import would fail because the target engine is not MyISAM and cannot be substituted.
     *
     * @see https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sqlmode_no_zero_date
     * @see https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sqlmode_no_zero_in_date
     * @see https://mariadb.com/docs/reference/mdb/system-variables/enforce_storage_engine/
     */
    private function emit_sql_header()
    {
        $this->current_sql_fragment = self::get_session_setup_sql();
    }

    /** Returns the connection settings required before executing dump SQL. */
    public static function get_session_setup_sql()
    {
        return "SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=1;\n" .
            "SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;\n" .
            // @TODO: Restore STRICT_TRANS_TABLES
            "SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,ERROR_FOR_DIVISION_BY_ZERO';\n" .
            "SET AUTOCOMMIT=0;\n";
    }

    /** Emits COMMIT and restores the session variables saved in the header. */
    private function emit_sql_footer()
    {
        $footer =
            "\nCOMMIT;\n" .
            "SET SQL_MODE=@OLD_SQL_MODE;\n" .
            "SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;\n" .
            "SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;\n";
        $this->current_sql_fragment = $footer;
    }

    /** Emits a SQL comment marking the start of data for the current table. */
    private function emit_table_header_comment()
    {
        $comment = "\n--\n-- Dumping data for table " . str_replace("\n",'\n',$this->row_reader->quote_identifier($this->row_reader->get_current_table())) . "\n--\n";
        $this->current_sql_fragment = $comment;
    }

    /** Advances to the next table and resets all per-table state. */
    private function move_to_next_table()
    {
        $has_table = $this->row_reader->move_to_next_table();
        if ($has_table) {
            $this->rows_in_batch = 0;
            $this->oversized_queue = [];
            $this->oversized_pk_values = null;
            $this->current_statement_size = 0;
            $this->reader_cursor_before_retained_record = null;
        }
        return $has_table;
    }

    /**
     * Returns the producer cursor as a JSON string.
     *
     * The caller can pass this string back as the "cursor" option to a new
     * MySQLDumpProducer to resume at the current SQL-fragment boundary. The
     * JSON is NOT base64-encoded — that's the HTTP layer's concern (export.php).
     *
     * String values in primary key checkpoints are wrapped in
     * {"__binary__": "<base64>"} markers because raw database bytes can't
     * survive JSON encoding. Complete database rows are omitted. During an
     * open INSERT, a fixed-size hash represents the ordered column names, which
     * are reloaded from table metadata on resume.
     */
    public function get_reentrancy_cursor()
    {
        $cursor_data = $this->reader_cursor_before_retained_record ??
            $this->row_reader->get_cursor_state();
        unset(
            $cursor_data["current_row"],
            $cursor_data["current_row_ends_query_batch"],
            $cursor_data["current_column_names"]
        );
        $current_column_names_hash = $this->get_current_column_names_hash();
        if ($current_column_names_hash !== null) {
            $cursor_data["current_column_names_hash"] = $current_column_names_hash;
        }
        $cursor_data["state"] = $this->state;
        $cursor_data["rows_in_batch"] = $this->rows_in_batch;
        /**
         * Tracking for rows that are larger than max_allowed_packet or
         * max_statement_size.
         */
        $cursor_data["oversized_queue"] = $this->encode_oversized_queue_for_cursor($this->oversized_queue);
        $cursor_data["current_statement_size"] = $this->current_statement_size;

        $json = json_encode($cursor_data);
        if ($json === false) {
            throw new \RuntimeException(
                "Failed to encode reentrancy cursor: " . json_last_error_msg()
            );
        }
        return $json;
    }

    /** Base64-encodes all chunk payloads in the oversized queue for JSON safety. */
    /**
     * The oversized queue entries are already cursor-safe (just column names,
     * data types, and integer offsets), so encoding is a no-op.
     */
    private function encode_oversized_queue_for_cursor($queue)
    {
        return $queue;
    }

    /** Reverses encode_oversized_queue_for_cursor(). */
    private function decode_oversized_queue_from_cursor($queue)
    {
        if (!is_array($queue)) {
            return [];
        }
        $decoded = [];
        foreach ($queue as $item) {
            if (
                !is_array($item) ||
                !isset($item['column'], $item['data_type'], $item['byte_offset'], $item['total_length'])
            ) {
                throw new \InvalidArgumentException(
                    "Invalid cursor: oversized_queue item must contain " .
                    "'column', 'data_type', 'byte_offset', and 'total_length' keys"
                );
            }
            $decoded_item = [
                'column' => $item['column'],
                'data_type' => $item['data_type'],
                'byte_offset' => (int) $item['byte_offset'],
                'total_length' => (int) $item['total_length'],
            ];
            if ($this->row_reader->is_character_string_type($item['data_type'])) {
                if (!array_key_exists('character_offset', $item)) {
                    if ((int) $item['byte_offset'] !== 0) {
                        throw new \InvalidArgumentException(
                            "The saved database pull cursor uses an earlier oversized text format. " .
                            "Run db-pull --abort and start again."
                        );
                    }
                    $decoded_item['character_offset'] = 0;
                } else {
                    $decoded_item['character_offset'] = (int) $item['character_offset'];
                }
            }
            $decoded[] = $decoded_item;
        }
        return $decoded;
    }

    /**
     * Restores internal state from a previously-serialized cursor.
     *
     * The row reader reloads column types and ordered names from table metadata.
     * A missing current table resets the producer to STATE_INIT. An active-table
     * cursor must contain the ordered-column hash saved at its fragment boundary.
     */
    private function initialize_from_cursor($cursor)
    {
        $cursor_data = json_decode($cursor, true);
        if ($cursor_data === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException(
                'Invalid cursor format: cursor must be valid JSON. ' .
                'JSON error: ' . json_last_error_msg() . '. ' .
                'Received: ' . substr($cursor, 0, 100)
            );
        }
        if (is_array($cursor_data)) {
            if (array_key_exists("current_row", $cursor_data)) {
                throw new \InvalidArgumentException(
                    "The saved database pull cursor uses an earlier format. " .
                    "Run db-pull --abort and start again."
                );
            }

            $this->state = $cursor_data["state"] ?? self::STATE_INIT;
            $this->rows_in_batch = $cursor_data["rows_in_batch"] ?? 0;
            if (!is_int($this->rows_in_batch) && !is_float($this->rows_in_batch)) {
                throw new \InvalidArgumentException(
                    "Invalid cursor: rows_in_batch must be numeric, got " . gettype($this->rows_in_batch)
                );
            }
            $this->rows_in_batch = (int) $this->rows_in_batch;

            $encoded_queue = $cursor_data["oversized_queue"] ?? [];
            $this->oversized_queue = $this->decode_oversized_queue_from_cursor($encoded_queue);
            $this->oversized_pk_values = null;
            if ($this->state === self::STATE_EMIT_OVERSIZED_UPDATE) {
                // The last emitted primary key identifies the row whose
                // oversized columns are still being appended.
                $this->oversized_pk_values = $this->row_reader->decode_database_values_from_cursor(
                    $cursor_data["last_pk_values"] ?? null
                );
            }
            $this->current_statement_size = $cursor_data["current_statement_size"] ?? 0;

            if (!$this->row_reader->restore_cursor_state($cursor_data)) {
                $this->state = self::STATE_INIT;
            } else {
                $expected_column_names_hash = $cursor_data["current_column_names_hash"] ?? null;
                $actual_column_names_hash = $this->get_current_column_names_hash();
                if ($actual_column_names_hash !== null) {
                    if ($expected_column_names_hash === null) {
                        throw new \InvalidArgumentException(
                            "Invalid cursor: an active table cursor must contain current_column_names_hash. " .
                            "Run db-pull --abort and start again."
                        );
                    }
                    if (
                        !is_string($expected_column_names_hash) ||
                        !preg_match('/^[0-9a-f]{64}$/D', $expected_column_names_hash)
                    ) {
                        throw new \InvalidArgumentException(
                            "Invalid cursor: current_column_names_hash must be a lowercase SHA-256 string"
                        );
                    }
                    if (!hash_equals($expected_column_names_hash, $actual_column_names_hash)) {
                        // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Cursor errors are returned as plain API messages.
                        throw new \RuntimeException(
                            "Cannot restore the database row cursor because the ordered columns for table " .
                            $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                            " changed. Run db-pull --abort and start again."
                        );
                        // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
                    }
                }
            }
        }
    }

    /** Returns a fixed-size SHA-256 hash of the current table's ordered column names. */
    private function get_current_column_names_hash()
    {
        if (
            $this->state === self::STATE_NEXT_TABLE ||
            $this->row_reader->get_current_table() === null
        ) {
            return null;
        }
        $column_names = $this->row_reader->get_current_column_names();
        if ($column_names === null) {
            return null;
        }
        return hash("sha256", serialize(array_values($column_names)));
    }

    /**
     * Formats a single column value as a SQL literal.
     *
     * Numeric types are emitted as bare literals. Everything else — strings,
     * binary, dates, enums — goes through FROM_BASE64(). JSON is special:
     * MySQL rejects binary-charset input for JSON columns, so we wrap with
     * CONVERT(... USING utf8mb4) to decode the base64 into a utf8mb4 string.
     * JSON can only be encoded as UTF-8 or UTF-16, and it's typically UTF-8.
     * As of this version, we do not support UTF-16-encoded JSON data strings.
     *
     * @TODO: Support UTF-16-encoded JSON data strings.
     */
    private function format_value($value, $data_type)
    {
        if ($value === null) {
            return "NULL";
        }

        if ($this->row_reader->is_numeric_type($data_type)) {
            return (string) $value;
        }

        if (strtoupper($data_type) === "JSON") {
            if ($value === "") {
                return "''";
            }
            $base64 = base64_encode($value);
            return "CONVERT(FROM_BASE64('" . $base64 . "') USING utf8mb4)";
        }

        // Treat all other data types as strings and encode them as base64. This
        // allows us to express all possible text encodings and arbitrary binary values.
        if ($value === "") {
            return "''";
        }
        return "FROM_BASE64('" . base64_encode($value) . "')";
    }

    /**
     * Estimates the byte length of format_value()'s output without actually
     * encoding. Used by format_row_for_insert() to decide whether a row
     * would exceed max_statement_size before doing the expensive encoding.
     */
    private function estimate_formatted_size($value, $data_type)
    {
        if ($value === null) {
            return 4; // NULL
        }

        if ($this->row_reader->is_numeric_type($data_type)) {
            return strlen((string) $value);
        }

        $len = strlen((string) $value);
        if ($len === 0) {
            return 2; // ''
        }

        /** Base64 output is always ceil(n/3)*4 bytes. */
        $estimated_base64_length = 4 * integer_divide($len + 2, 3);
        // FROM_BASE64('<data>') adds 15 bytes. JSON adds the surrounding
        // CONVERT(... USING utf8mb4), for 38 wrapper bytes in total.
        $wrapper_bytes = strtoupper($data_type) === "JSON" ? 38 : 15;
        return $wrapper_bytes + $estimated_base64_length;
    }

    /** Auto-detects max_allowed_packet and uses 80% of it. Falls back to 1MB. */
    private function detect_max_statement_size()
    {
        try {
            $result = $this->db->query("SELECT @@max_allowed_packet as max_allowed_packet");
            $row = $result->fetch(PdoConstants::fetch_assoc());
            if ($row && isset($row['max_allowed_packet'])) {
                return (int)($row['max_allowed_packet'] * 0.8);
            }
        } catch (\Exception $e) {
        }

        return 1024 * 1024;
    }

    /**
     * Formats a row as a VALUES tuple, splitting oversized columns if needed.
     *
     * The approach is estimate-first: compute the approximate encoded size of
     * each column before doing the actual (expensive) base64 encoding. If the
     * row fits the statement and part-body limits, encode everything. If it
     * doesn't, replace eligible large non-PK columns with '' and queue their
     * real values as UPDATE ... CONCAT() chunks in $this->oversized_queue.
     *
     * Tables without a primary key can't use the UPDATE fallback because
     * there is no stable row identifier for the WHERE clause. Reject those
     * rows before building an over-limit SQL fragment.
     */
    private function format_row_for_insert($row, $sql_fragment_fixed_bytes)
    {
        $estimated_sizes = [];
        $raw_values = [];

        foreach ($this->row_reader->get_current_column_names() as $col) {
            $value = $row[$col] ?? null;
            $raw_values[$col] = $value;
            $data_type = $this->row_reader->get_data_type($col);
            $estimated_sizes[$col] = $this->estimate_formatted_size($value, $data_type);
        }

        $row_tuple_bytes = $this->estimate_formatted_row_tuple_bytes($row);
        $row_separator_bytes = $this->rows_in_batch > 0 ? 1 : 0;
        $maximum_insert_statement_bytes = min(
            $this->max_statement_size,
            self::MAX_SQL_PART_BODY_BYTES
        );
        $projected_statement_size =
            $this->current_statement_size + $row_separator_bytes + $row_tuple_bytes;
        $projected_fragment_size =
            $sql_fragment_fixed_bytes + $row_separator_bytes + $row_tuple_bytes;

        if (
            $projected_statement_size <= $maximum_insert_statement_bytes &&
            $projected_fragment_size <= self::MAX_SQL_PART_BODY_BYTES
        ) {
            $formatted_values = [];
            foreach ($this->row_reader->get_current_column_names() as $col) {
                $data_type = $this->row_reader->get_data_type($col);
                $formatted_values[$col] = $this->format_value($raw_values[$col], $data_type);
            }
            return "(" . implode(",", array_values($formatted_values)) . ")";
        }

        // The rest of this method deals with rows that are too large to fit into a single INSERT on
        // the receiving end.

        if (!$this->row_reader->get_current_primary_key_columns() || count($this->row_reader->get_current_primary_key_columns()) === 0) {
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
            throw new \RuntimeException(
                "Row in table " . $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                " has an estimated current INSERT size of {$projected_statement_size} bytes and SQL fragment size of" .
                " {$projected_fragment_size} bytes. The limits are max_statement_size" .
                " ({$this->max_statement_size} bytes) and the SQL part body limit" .
                " (" . self::MAX_SQL_PART_BODY_BYTES . " bytes)," .
                " but the table has no primary key, so the oversized row" .
                " cannot be split into UPDATE ... CONCAT() chunks."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        $this->oversized_pk_values = [];
        foreach ($this->row_reader->get_current_primary_key_columns() as $pk_col) {
            if (!array_key_exists($pk_col, $row)) {
                throw new \RuntimeException(
                    "Primary key column '{$pk_col}' missing from row for table " .
                    $this->row_reader->quote_identifier($this->row_reader->get_current_table())
                );
            }
            $this->oversized_pk_values[$pk_col] = $row[$pk_col];
        }

        // Split the largest columns first to bring the row under the limit
        $sorted_sizes = $estimated_sizes;
        arsort($sorted_sizes);

        $this->oversized_queue = [];
        $chunked_columns = [];

        $excess = max(
            $projected_statement_size - $maximum_insert_statement_bytes,
            $projected_fragment_size - self::MAX_SQL_PART_BODY_BYTES
        );
        $saved_bytes = 0;
        $unchunkable_data_types = [];

        foreach ($sorted_sizes as $col => $size) {
            if (in_array($col, $this->row_reader->get_current_primary_key_columns())) {
                continue;
            }

            if ($size < 1000) {
                continue;
            }

            if ($excess <= 0) {
                break;
            }

            $raw_value = $raw_values[$col];
            if ($raw_value === null || $raw_value === '') {
                continue;
            }

            $data_type = $this->row_reader->get_data_type($col);
            $normalized_data_type = strtoupper($data_type);
            if (
                !$this->row_reader->is_binary_type($normalized_data_type) &&
                !$this->row_reader->is_character_string_type($normalized_data_type)
            ) {
                $unchunkable_data_types[$normalized_data_type] = true;
                continue;
            }
            $value_length = strlen($raw_value);
            $chunk_size = $this->compute_chunk_size($col);

            if ($value_length > $chunk_size) {
                $chunked_columns[$col] = true;
                $saved_bytes += $size - 2; // Saved bytes (size minus the '' replacement)
                $excess -= $size - 2;

                $queue_item = [
                    'column' => $col,
                    'data_type' => $data_type,
                    'byte_offset' => 0,
                    'total_length' => $value_length,
                ];
                if ($this->row_reader->is_character_string_type($data_type)) {
                    $queue_item['character_offset'] = 0;
                }
                $this->oversized_queue[] = $queue_item;
            }
        }

        if ($excess > 0 && !empty($unchunkable_data_types)) {
            $unchunkable_data_type = key($unchunkable_data_types);
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
            throw new \RuntimeException(
                "Row in table " . $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                " cannot use UPDATE ... CONCAT() chunks for data type {$unchunkable_data_type}."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        if (
            $projected_statement_size - $saved_bytes >
                $maximum_insert_statement_bytes ||
            $projected_fragment_size - $saved_bytes >
                self::MAX_SQL_PART_BODY_BYTES
        ) {
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
            throw new \RuntimeException(
                "Row in table " . $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                " cannot fit the SQL size limits with the available UPDATE chunking." .
                " max_statement_size is {$this->max_statement_size}" .
                " bytes and the SQL part body limit is " . self::MAX_SQL_PART_BODY_BYTES . " bytes."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        if (empty($chunked_columns)) {
            $this->oversized_pk_values = null;
        }

        $formatted_values = [];
        foreach ($this->row_reader->get_current_column_names() as $col) {
            if (isset($chunked_columns[$col])) {
                $formatted_values[$col] = "''";
                continue;
            }
            $data_type = $this->row_reader->get_data_type($col);
            $formatted_values[$col] = $this->format_value($raw_values[$col], $data_type);
        }

        return "(" . implode(",", array_values($formatted_values)) . ")";
    }

    /** Returns the exact SQL bytes used by one formatted VALUES tuple. */
    private function estimate_formatted_row_tuple_bytes($row)
    {
        $tuple_bytes = 2;
        $column_index = 0;
        foreach ($this->row_reader->get_current_column_names() as $column) {
            if ($column_index > 0) {
                ++$tuple_bytes;
            }
            $tuple_bytes += $this->estimate_formatted_size(
                $row[$column] ?? null,
                $this->row_reader->get_data_type($column)
            );
            ++$column_index;
        }
        return $tuple_bytes;
    }

    /**
     * Computes the maximum raw byte size of each chunk for the given column,
     * such that an UPDATE ... SET col = CONCAT(col, FROM_BASE64('...'))
     * statement stays within both SQL size limits.
     */
    private function compute_chunk_size($column)
    {
        $quoted_table = $this->row_reader->quote_identifier($this->row_reader->get_current_table());
        $quoted_column = $this->row_reader->quote_identifier($column);
        $update_overhead = strlen("UPDATE {$quoted_table} SET {$quoted_column} = CONCAT({$quoted_column}, ) WHERE ;");
        $where_clause_size = $this->estimate_pk_where_size();
        $total_overhead = $update_overhead + $where_clause_size + 100; // Extra margin

        $maximum_update_statement_size = min(
            $this->max_statement_size,
            self::MAX_SQL_PART_BODY_BYTES
        );
        $max_chunk_raw_size = ($maximum_update_statement_size - $total_overhead);

        // Base64 inflates by ~1.33x, plus FROM_BASE64('') wrapper overhead
        $max_chunk_raw_size = (int)(($max_chunk_raw_size - 20) / 1.34);
        return max($max_chunk_raw_size, 1000);
    }

    /** Rough strlen() estimate for the WHERE pk1 = v1 AND pk2 = v2 clause. */
    private function estimate_pk_where_size()
    {
        if (!$this->oversized_pk_values) {
            /**
             * A wild guess. 1KB is probably more than necessary, but we're trying to stay
             * on the safe side.
             */
            return 1024;
        }

        $size = 0;
        foreach ($this->oversized_pk_values as $col => $value) {
            $size += strlen($this->row_reader->build_comparison($col, $value, "="));
            $size += 5; // AND
        }

        return (int)$size;
    }

    /**
     * Emits one UPDATE ... SET col = CONCAT(col, chunk) statement.
     *
     * Instead of storing the entire column value in memory, this method
     * re-reads just the needed chunk from the database using SUBSTRING().
     * This keeps the cursor tiny (byte offsets only) while still producing
     * the correct UPDATE statements.
     *
     * Returns false when the queue is drained so the next INSERT can begin.
     */
    private function emit_oversized_update()
    {
        if (empty($this->oversized_queue)) {
            $this->state = self::STATE_START_INSERT;
            $this->oversized_pk_values = null;
            return false;
        }

        $current = $this->oversized_queue[0];
        $column = $current['column'];
        $data_type = $current['data_type'];
        $byte_offset = $current['byte_offset'];
        $total_length = $current['total_length'];

        $chunk_size = $this->compute_chunk_size($column);

        // MySQL SUBSTRING() counts characters for character strings, while
        // $chunk_size is a byte budget. Every requested character may use the
        // column character set's maximum byte length, so a fixed amount of
        // spare space would not bound the result. Divide the byte budget by
        // that per-character maximum to keep the raw chunk within its limit
        // without splitting a character. Binary strings continue in bytes.
        $character_string = $this->row_reader->is_character_string_type($data_type);
        if ($character_string) {
            $value_offset = $current['character_offset'];
            $value_length = max(
                1,
                integer_divide(
                    $chunk_size,
                    $this->row_reader->get_maximum_character_bytes($column)
                )
            );
        } else {
            $value_offset = $byte_offset;
            $value_length = min($chunk_size, $total_length - $byte_offset);
        }

        $chunk_result = $this->fetch_value_substring_from_the_current_oversized_row(
            $column,
            $value_offset + 1,
            $value_length,
            $character_string
        );
        $chunk = $chunk_result['value'];
        $chunk_bytes = strlen($chunk);

        if ($chunk_bytes === 0 && $byte_offset < $total_length) {
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
            throw new \RuntimeException(
                "Oversized column " .
                $this->row_reader->quote_identifier($this->row_reader->get_current_table()) . "." .
                $this->row_reader->quote_identifier($column) .
                " returned an empty chunk at byte offset {$byte_offset} before its saved" .
                " {$total_length}-byte length. The source value changed during export;" .
                " run db-pull --abort and start again."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }
        if ($chunk_bytes > $total_length - $byte_offset) {
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
            throw new \RuntimeException(
                "Oversized column " .
                $this->row_reader->quote_identifier($this->row_reader->get_current_table()) . "." .
                $this->row_reader->quote_identifier($column) .
                " returned {$chunk_bytes} bytes at byte offset {$byte_offset}, beyond its" .
                " saved {$total_length}-byte length. The source value changed during export;" .
                " run db-pull --abort and start again."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        $formatted_chunk = $this->format_value($chunk, $data_type);

        $where_parts = [];
        foreach ($this->oversized_pk_values as $pk_col => $pk_value) {
            $where_parts[] = $this->row_reader->build_comparison($pk_col, $pk_value, "=");
        }
        $where_clause = implode(" AND ", $where_parts);

        $quoted_table = $this->row_reader->quote_identifier($this->row_reader->get_current_table());
        $quoted_column = $this->row_reader->quote_identifier($column);
        $sql = "UPDATE {$quoted_table} SET {$quoted_column} = CONCAT({$quoted_column}, {$formatted_chunk}) WHERE {$where_clause};";

        $this->current_sql_fragment = $sql;

        $this->oversized_queue[0]['byte_offset'] += $chunk_bytes;
        if ($character_string) {
            $this->oversized_queue[0]['character_offset'] += $chunk_result['value_length'];
        }
        if ($this->oversized_queue[0]['byte_offset'] >= $total_length) {
            array_shift($this->oversized_queue);
        }

        return true;
    }

    /**
     * Fetches a substring of a column value from the current table using
     * the oversized row's primary key values.
     *
     * Character strings use character ranges so a chunk never cuts a
     * multibyte character. Binary strings cast before SUBSTRING so their
     * ranges count bytes. Both return raw bytes for base64 encoding.
     *
     * @return array {
     *     Fetched substring details.
     *
     *     @type string $value        Raw substring bytes.
     *     @type int    $value_length Length in characters or bytes, matching the requested range.
     * }
     */
    private function fetch_value_substring_from_the_current_oversized_row(
        string $column,
        int $start,
        int $length,
        bool $character_string
    ): array {
        $quoted_table = $this->row_reader->quote_identifier($this->row_reader->get_current_table());
        $quoted_column = $this->row_reader->quote_identifier($column);

        $where_parts = [];
        foreach ($this->oversized_pk_values as $pk_col => $pk_value) {
            $where_parts[] = $this->row_reader->build_comparison($pk_col, $pk_value, "=");
        }
        $where_clause = implode(" AND ", $where_parts);

        $value_expression = $character_string
            ? "SUBSTRING({$quoted_column}, {$start}, {$length})"
            : "SUBSTRING(CAST({$quoted_column} AS BINARY), {$start}, {$length})";
        $sql = "SELECT CAST({$value_expression} AS BINARY) AS value_chunk,"
             . " CHAR_LENGTH({$value_expression}) AS value_length"
             . " FROM {$quoted_table} WHERE {$where_clause}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PdoConstants::fetch_assoc());

        if ($result === false) {
            throw new \RuntimeException(
                "Failed to fetch column substring for oversized row: {$column}"
            );
        }

        return [
            'value' => $result['value_chunk'],
            'value_length' => (int) $result['value_length'],
        ];
    }

    /** @return bool */
    private function has_pending_oversized_updates()
    {
        return !empty($this->oversized_queue);
    }
}
