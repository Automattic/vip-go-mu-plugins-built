<?php

namespace WordPress\Reprint\Server;

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
 *   START_INSERT ⇄ EMIT_ROW → (EMIT_NULLABLE_SPATIAL_COLUMNS) →
 *   (STAGE_OVERSIZED_SPATIAL) → (EMIT_OVERSIZED_UPDATE) → … →
 *   EMIT_FOOTER → FINISHED
 *
 * Selected-site exports finish the content table group before collecting site
 * members from network usermeta, then export users and profiles:
 *
 *   content tables → COLLECT_SITE_MEMBERS → users → usermeta → footer
 *
 * Posts, comments and links save their user IDs alongside each content batch.
 * Omitted or row-filtered content uses COLLECT_CONTENT_USER_IDS while visiting
 * that table, with the same table/primary-key cursor. Membership has only one
 * input table and its own last_scanned_usermeta_id. Both ID-only reads and the
 * boundaries before and after membership collection emit checkpoint statements.
 *
 * All values are base64-encoded in the SQL output (via FROM_BASE64('...')). This avoids
 * charset-related corruption: MySQL interprets string literals according to the
 * connection charset, but base64 is pure ASCII and the decoded bytes are assigned
 * directly to the column's declared charset. JSON columns are a special case — MySQL
 * rejects binary charset input for JSON, so those get an extra CONVERT(... USING utf8mb4).
 *
 * For keyed rows, eligible large text and binary columns can be inserted as empty
 * strings and then filled via UPDATE ... SET col = CONCAT(col, chunk) statements.
 * Complete spatial values are assembled in a durable helper table before the row
 * is inserted, so constraints never inspect an invented geometry. The INSERT reads
 * the complete bytes from the helper, then the dump footer drops the helper.
 *
 * Known limitations:
 *
 * - Large spatial values use byte-range queries, but other columns are still selected
 *   whole. A non-spatial row larger than max_allowed_packet or PHP memory_limit cannot
 *   be exported.
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

    /** Starts the importer marker whose remaining words are base64 table and column names. */
    public const NULLABLE_SPATIAL_COLUMNS_COMMENT_PREFIX =
        "/* REPRINT: make zero-byte spatial columns nullable ";

    /** Marks a zero-byte spatial placeholder for the MariaDB importer path. */
    public const ZERO_BYTE_SPATIAL_VALUE_COMMENT =
        "/* REPRINT: zero-byte spatial value */";

    private const SPATIAL_STAGING_TABLE = "__reprint_db_pull_progress_spatial";

    /**
     * Opens the SQL comment which carries nonzero-SRID row details to the importer.
     *
     * The importer searches for this exact prefix before executing an INSERT. This
     * avoids teaching the importer how to parse MySQL INSERT syntax.
     */
    public const NONZERO_SRID_COMMENT_PREFIX =
        "/* REPRINT: nonzero spatial SRID ";

    /**
     * Identifies the JSON object written after NONZERO_SRID_COMMENT_PREFIX.
     *
     * The importer rejects unknown versions rather than guessing how to read row
     * details which are used to decide whether an INSERT is safe.
     */
    public const NONZERO_SRID_CONTEXT_VERSION = 'v1';

    private const STATE_COLLECT_CONTENT_USER_IDS = "collect_content_user_ids";
    private const STATE_COLLECT_SITE_MEMBERS = "collect_site_members";
    const STATE_INIT = "init";
    const STATE_EMIT_HEADER = "emit_header";
    const STATE_NEXT_TABLE = "next_table";
    const STATE_CREATE_TABLE = "create_table";
    const STATE_TABLE_HEADER = "table_header";
    const STATE_START_INSERT = "start_insert";
    const STATE_EMIT_ROW = "emit_row";
    const STATE_EMIT_NULLABLE_SPATIAL_COLUMNS = "emit_nullable_spatial_columns";
    const STATE_STAGE_OVERSIZED_SPATIAL = "stage_oversized_spatial";
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
     * protocol framing). Rows whose formatted SQL exceeds this limit use
     * empty text or binary values followed by UPDATE ... CONCAT() chunks.
     * Spatial values are staged completely before their INSERT.
     *
     * @var int
     */
    private $max_statement_size;

    /** @var int Exact target max_allowed_packet used as the spatial value ceiling. */
    private $target_max_allowed_packet;

    /**
     * When a row is too large for a single INSERT, its big columns are split
     * into chunks and queued here. Each entry tracks the column name, its
     * data type, the current byte offset into the value, and the total byte
     * length. Character columns also track a character offset because MySQL's
     * SUBSTRING() counts characters for those types. Spatial columns track
     * their staging id and next chunk number. The actual data is
     * re-fetched from the database on demand, keeping cursors small (a few
     * hundred bytes rather than megabytes of raw data).
     *
     * @var array Array of {column: string, data_type: string, byte_offset: int, total_length: int, character_offset?: int, spatial_staging_id?: int, chunk_number?: int}
     */
    private $oversized_queue = [];

    /** @var array|null */
    private $oversized_pk_values = null;

    /** @var bool Whether the dump has created its target spatial staging table. */
    private $spatial_staging_table_created = false;

    /** @var array<string,array{staging_id:int,chunk_count:int}> Complete staged chunks keyed by target column name. */
    private $staged_spatial_columns = [];

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

    /** @var string[] Spatial columns already changed to nullable in the dump. */
    private $nullable_spatial_columns = [];

    /** @var string[] Spatial columns waiting for their nullable ALTER TABLE. */
    private $pending_nullable_spatial_columns = [];

    /**
     * Whether the open multi-row INSERT already has a nonzero-SRID marker.
     *
     * One marker stops the entire INSERT when source and target spatial rules
     * differ, so later affected rows in the same INSERT do not need more markers.
     *
     * @var bool
     */
    private $current_insert_has_nonzero_srid_context = false;

    /**
     * @param object $db Database connection — either a real PDO (MySQL) or a
     *        PDO-compatible adapter (SQLite sites). No type hint because the
     *        adapter isn't a PDO subclass and PHP 7.4 lacks union types.
     */
    public function __construct($db, $options = [])
    {
        $this->db = $db;
        $this->emit_create_table = (bool) ( $options["create_table_query"] ?? true );

        $detected_source_max_allowed_packet = $this->detect_max_allowed_packet();
        $source_max_allowed_packet = $detected_source_max_allowed_packet ?? 1024 * 1024;
        $this->target_max_allowed_packet = isset($options["target_max_allowed_packet"])
            ? (int) $options["target_max_allowed_packet"]
            : $source_max_allowed_packet;
        if ($this->target_max_allowed_packet < 1) {
            throw new \InvalidArgumentException(
                "target_max_allowed_packet must be a positive byte count."
            );
        }

        if (isset($options["max_statement_size"])) {
            $this->max_statement_size = (int)$options["max_statement_size"];
        } else {
            $this->max_statement_size = $detected_source_max_allowed_packet === null
                ? 1024 * 1024
                : (int) ($source_max_allowed_packet * 0.8);
        }

        $options["maximum_inline_spatial_bytes"] = min(
            $this->max_statement_size,
            (int) ($source_max_allowed_packet * 0.8),
            $this->target_max_allowed_packet
        );
        $this->row_reader = new DatabaseRowsReader($db, $options);

        if (isset($options["cursor"])) {
            $this->initialize_from_cursor($options["cursor"]);
        }
    }

    /** Releases a partially consumed source query and the selected site's lock. */
    public function close(): void
    {
        if ($this->row_reader !== null) {
            $this->row_reader->close();
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
                        $this->state = $this->row_reader->get_current_table_export_mode() === 'rows'
                            ? ( $this->emit_create_table ? self::STATE_CREATE_TABLE : self::STATE_TABLE_HEADER )
                            : self::STATE_COLLECT_CONTENT_USER_IDS;
                    } elseif ($this->row_reader->start_user_tables()) {
                        // Only the end of the content group enters membership
                        // collection. Checkpoint before the first metadata read.
                        $this->state = self::STATE_COLLECT_SITE_MEMBERS;
                        $this->current_sql_fragment = "-- Begin site membership collection\nDO 0;";
                        $this->current_fragment_must_be_its_own_part = true;
                        return true;
                    } else {
                        $this->state = self::STATE_EMIT_FOOTER;
                    }
                    break;

                case self::STATE_COLLECT_CONTENT_USER_IDS:
                    if ($this->row_reader->collect_content_user_ids_step()) {
                        // A complete harmless statement carries the ID cursor
                        // through the normal SQL/target commit path.
                        $this->current_sql_fragment = "-- Collect content user IDs\nDO 0;";
                        $this->current_fragment_must_be_its_own_part = true;
                        return true;
                    }
                    $this->state = $this->row_reader->get_current_table_export_mode() === 'user_ids'
                        ? self::STATE_NEXT_TABLE
                        : ( $this->emit_create_table ? self::STATE_CREATE_TABLE : self::STATE_TABLE_HEADER );
                    break;

                case self::STATE_COLLECT_SITE_MEMBERS:
                    if ($this->row_reader->collect_site_members_step()) {
                        $this->current_sql_fragment = "-- Collect site members\nDO 0;";
                    } else {
                        $this->state = self::STATE_NEXT_TABLE;
                        $this->current_sql_fragment = "-- Begin user and profile export\nDO 0;";
                    }
                    $this->current_fragment_must_be_its_own_part = true;
                    return true;

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

                case self::STATE_EMIT_NULLABLE_SPATIAL_COLUMNS:
                    $this->emit_nullable_spatial_columns();
                    $this->state = self::STATE_START_INSERT;
                    $this->current_fragment_must_be_its_own_part = true;
                    return true;

                case self::STATE_STAGE_OVERSIZED_SPATIAL:
                    if ($this->stage_oversized_spatial_value()) {
                        $this->current_fragment_must_be_its_own_part = true;
                        return true;
                    }
                    break;

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
        $this->current_insert_has_nonzero_srid_context = false;
        $reader_cursor_before_current_record = $this->reader_cursor_before_retained_record;
        if ($this->row_reader->get_current_record() === null) {
            $reader_cursor_before_current_record = $this->row_reader->get_cursor_state();
            $read_result = $this->row_reader->next_record();
            if ($read_result === false) {
                $this->state = self::STATE_NEXT_TABLE;
                return false;
            }
            if ($read_result === null) {
                // Rejected candidates still need a checkpoint. Do not search
                // the next batch inside this step when no SQL row was found.
                $this->current_sql_fragment = 'DO 0; /* selected-user batch complete */';
                $this->current_fragment_must_be_its_own_part = true;
                return true;
            }
        }

        $current_record = $this->row_reader->get_current_record();
        $has_zero_byte_spatial_value = $this->has_zero_byte_spatial_value();
        $spatial_columns = $this->get_spatial_columns_to_make_nullable();
        if (!empty($spatial_columns)) {
            $this->reader_cursor_before_retained_record = $reader_cursor_before_current_record;
            $this->pending_nullable_spatial_columns = $spatial_columns;
            $this->state = self::STATE_EMIT_NULLABLE_SPATIAL_COLUMNS;
            return false;
        }
        $nonzero_srid_comment = $this->format_nonzero_srid_comment($current_record);
        $nonzero_srid_prefix = $nonzero_srid_comment === ''
            ? ''
            : $nonzero_srid_comment . "\n";

        $column_list = implode(
            ",",
            array_map(function ($col) {
                return $this->row_reader->quote_identifier($col);
            }, $this->row_reader->get_current_column_names())
        );

        $header = "INSERT INTO " . $this->row_reader->quote_identifier($this->row_reader->get_current_table()) . " ({$column_list}) VALUES\n";
        $this->current_statement_size = strlen($header) + strlen($this->on_duplicate_key()) + 1;
        $this->current_statement_size += strlen($nonzero_srid_prefix);

        $current_record_ends_query_batch = $this->row_reader->is_current_record_at_query_batch_boundary();
        $first_row_sql = $this->format_row_for_insert(
            $this->row_reader->get_current_record(),
            $this->current_statement_size
        );
        $this->current_statement_size += strlen($first_row_sql);

        if ($this->has_pending_spatial_staging()) {
            // Keep this row out of the target until each spatial value is
            // complete. The ordered reader remains after this row. A resumed
            // producer re-fetches it by primary key for the final INSERT.
            $this->reader_cursor_before_retained_record = null;
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->state = self::STATE_STAGE_OVERSIZED_SPATIAL;
            return false;
        }

        $this->reader_cursor_before_retained_record = null;
        $this->rows_in_batch = 1;
        $this->current_insert_has_nonzero_srid_context = $nonzero_srid_comment !== '';

        // Oversized updates require closing this INSERT with a semicolon so the
        // subsequent UPDATE statements are syntactically separate.
        $has_oversized = $this->has_pending_oversized_updates();
        $this->staged_spatial_columns = [];

        if (
            $current_record_ends_query_batch ||
            $this->rows_in_batch >= $this->row_reader->get_batch_size() ||
            $has_zero_byte_spatial_value
        ) {
            $this->finish_insert_batch(
                $header . $nonzero_srid_prefix . $first_row_sql,
                $has_oversized
            );
            $this->row_reader->clear_current_record();
            return true;
        }

        $this->row_reader->clear_current_record();
        if ($has_oversized) {
            $sql = $header . $nonzero_srid_prefix . $first_row_sql .
                $this->on_duplicate_key() . ';';
            $this->current_sql_fragment = $sql;
            $this->current_statement_size = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_EMIT_OVERSIZED_UPDATE;
        } else {
            $sql = $header . $nonzero_srid_prefix . $first_row_sql;
            $this->current_sql_fragment = $sql;
            $this->state = self::STATE_EMIT_ROW;
        }

        return true;
    }

    /** Emits one row, or closes the INSERT at table EOF or a consumed candidate batch. */
    private function emit_row()
    {
        $reader_cursor_before_current_record = $this->row_reader->get_cursor_state();
        $read_result = $this->row_reader->next_record();
        if ($read_result !== true) {
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = $read_result === false ? self::STATE_NEXT_TABLE : self::STATE_START_INSERT;
            return true;
        }

        $spatial_columns = $this->get_spatial_columns_to_make_nullable();
        if (!empty($spatial_columns)) {
            // Finish the INSERT before changing its table definition. The
            // retained row starts a new INSERT after the ALTER TABLE.
            $this->reader_cursor_before_retained_record = $reader_cursor_before_current_record;
            $this->pending_nullable_spatial_columns = $spatial_columns;
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_EMIT_NULLABLE_SPATIAL_COLUMNS;
            return true;
        }

        if ($this->has_zero_byte_spatial_value()) {
            // MariaDB needs this row's INSERT column list to omit its
            // zero-byte geometry. Close the preceding multi-row INSERT and
            // retain the row for a one-row INSERT after this fragment.
            $this->reader_cursor_before_retained_record = $reader_cursor_before_current_record;
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_START_INSERT;
            return true;
        }

        $nonzero_srid_comment = $this->current_insert_has_nonzero_srid_context
            ? ''
            : $this->format_nonzero_srid_comment($this->row_reader->get_current_record());
        $row_prefix = $nonzero_srid_comment === ''
            ? ','
            : ",\n" . $nonzero_srid_comment . "\n";
        $row_tuple_bytes = $this->estimate_formatted_row_tuple_bytes(
            $this->row_reader->get_current_record()
        );
        $maximum_insert_statement_bytes = min(
            $this->max_statement_size,
            self::MAX_SQL_PART_BODY_BYTES
        );
        if (
            $this->current_statement_size + strlen($row_prefix) + $row_tuple_bytes >
                $maximum_insert_statement_bytes
        ) {
            // This row fits as the first row of another INSERT, but not in the
            // current one. Keep it in memory for the live producer. A resumed
            // producer uses the earlier cursor and fetches it again.
            $this->reader_cursor_before_retained_record = $reader_cursor_before_current_record;
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_START_INSERT;
            return true;
        }

        $current_record_ends_query_batch = $this->row_reader->is_current_record_at_query_batch_boundary();
        $row_sql = $this->format_row_for_insert(
            $this->row_reader->get_current_record(),
            strlen($this->on_duplicate_key()) + 1
        );
        if ($this->has_pending_spatial_staging()) {
            $this->reader_cursor_before_retained_record = null;
            $this->current_sql_fragment = $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->rows_in_batch = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_STAGE_OVERSIZED_SPATIAL;
            return true;
        }
        $row_fragment = $row_prefix . $row_sql;
        $this->current_statement_size += strlen($row_fragment);
        if ($nonzero_srid_comment !== '') {
            $this->current_insert_has_nonzero_srid_context = true;
        }
        $this->row_reader->clear_current_record();
        $this->rows_in_batch++;

        $has_oversized = $this->has_pending_oversized_updates();
        $this->staged_spatial_columns = [];

        if (
            $current_record_ends_query_batch ||
            $this->rows_in_batch >= $this->row_reader->get_batch_size()
        ) {
            $this->finish_insert_batch($row_fragment, $has_oversized);
            return true;
        }

        if ($has_oversized) {
            $this->current_sql_fragment = $row_fragment . $this->on_duplicate_key() . ';';
            $this->current_statement_size = 0;
            $this->current_insert_has_nonzero_srid_context = false;
            $this->state = self::STATE_EMIT_OVERSIZED_UPDATE;
        } else {
            $this->current_sql_fragment = $row_fragment;
        }

        return true;
    }

    /**
     * Makes target columns nullable before emitting zero-byte spatial values.
     *
     * MariaDB can fill old rows with a zero-byte spatial value when a NOT NULL
     * spatial column is added. Neither MariaDB nor MySQL accepts those bytes in
     * an INSERT, so the dump represents that missing geometry as NULL.
     */
    private function emit_nullable_spatial_columns()
    {
        if (empty($this->pending_nullable_spatial_columns)) {
            throw new \RuntimeException(
                "Cannot emit a nullable spatial ALTER TABLE without any pending columns."
            );
        }

        // The valid fallback keeps the dump usable by importers which do not
        // recognize the marker. Importers which recognize it rebuild the ALTER
        // from the target definition so MODIFY COLUMN keeps every attribute.
        $table = $this->row_reader->get_current_table();
        $encoded_identifiers = [base64_encode($table)];
        $definitions = [];
        foreach ($this->pending_nullable_spatial_columns as $column) {
            $encoded_identifiers[] = base64_encode($column);
            $column_metadata = $this->row_reader->get_column_metadata($column);
            $definition = "MODIFY COLUMN " . $this->row_reader->quote_identifier($column) .
                " " . $column_metadata["column_type"] . " NULL";
            if ($column_metadata["comment"] !== "") {
                $quoted_comment = $this->db->quote($column_metadata["comment"]);
                if (!is_string($quoted_comment)) {
                    // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Schema errors are API text.
                    throw new \RuntimeException(
                        "Failed to quote the comment for column " .
                        $this->row_reader->quote_identifier($column) . "."
                    );
                    // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
                }
                $definition .= " COMMENT {$quoted_comment}";
            }
            $definitions[] = $definition;
        }

        $quoted_table = $this->row_reader->quote_identifier($table);
        $this->current_sql_fragment = self::NULLABLE_SPATIAL_COLUMNS_COMMENT_PREFIX .
            implode(" ", $encoded_identifiers) . " */\n" .
            "ALTER TABLE {$quoted_table}\n" .
            implode(",\n", $definitions) . ";";
        foreach ($this->pending_nullable_spatial_columns as $column) {
            $this->nullable_spatial_columns[] = $column;
        }
        $this->pending_nullable_spatial_columns = [];
    }

    /** Returns NOT NULL spatial columns which contain a zero-byte value in this row. */
    private function get_spatial_columns_to_make_nullable()
    {
        $columns = [];
        foreach ($this->row_reader->get_current_column_names() as $column) {
            $column_metadata = $this->row_reader->get_column_metadata($column);
            if (
                !$this->row_reader->is_spatial_type($column_metadata["data_type"]) ||
                $this->row_reader->get_current_spatial_value_length($column) !== 0 ||
                $column_metadata["nullable"] ||
                in_array($column, $this->nullable_spatial_columns, true)
            ) {
                continue;
            }
            $columns[] = $column;
        }
        return $columns;
    }

    /** Returns whether this row contains a MariaDB zero-byte spatial placeholder. */
    private function has_zero_byte_spatial_value()
    {
        foreach ($this->row_reader->get_current_column_names() as $column) {
            if (
                $this->row_reader->is_spatial_type($this->row_reader->get_data_type($column)) &&
                $this->row_reader->get_current_spatial_value_length($column) === 0
            ) {
                return true;
            }
        }
        return false;
    }

    /** Finishes an INSERT batch at its bounded row limit. */
    private function finish_insert_batch($sql, $has_oversized)
    {
        $this->current_sql_fragment = $sql . $this->on_duplicate_key() . ';';
        $this->current_statement_size = 0;
        $this->current_insert_has_nonzero_srid_context = false;
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
        $footer = "\nCOMMIT;\n";
        if ($this->spatial_staging_table_created) {
            $quoted_staging_table = $this->row_reader->quote_identifier(
                self::SPATIAL_STAGING_TABLE
            );
            $footer .= "DROP TABLE IF EXISTS {$quoted_staging_table};\n";
        }
        $footer .=
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
            $this->staged_spatial_columns = [];
            $this->current_statement_size = 0;
            $this->reader_cursor_before_retained_record = null;
            $this->nullable_spatial_columns = [];
            $this->pending_nullable_spatial_columns = [];
            $this->current_insert_has_nonzero_srid_context = false;
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
        $tables_total = (int) ( $cursor_data["tables_total"] ?? 0 );
        $current_table_number = $cursor_data["current_table_number"] ?? null;
        $tables_done = (int) ( $cursor_data["tables_before_current"] ?? 0 );
        $progress_current_table = null;
        if ($this->state === self::STATE_FINISHED || $this->state === self::STATE_EMIT_FOOTER) {
            $tables_done = $tables_total;
        } elseif ($this->state === self::STATE_NEXT_TABLE) {
            $tables_done = $current_table_number ?? $tables_done;
        } elseif ($current_table_number !== null) {
            $tables_done = $current_table_number - 1;
            $progress_current_table = [
                "name" => $cursor_data["current_table"],
                "rows_done" => (int) ( $cursor_data["current_table_rows_processed"] ?? 0 ),
                "rows_total" => $cursor_data["current_table_rows_estimated"] ?? null,
            ];
        }
        $cursor_data["progress"] = [
            "tables" => [
                "done" => $tables_done,
                "total" => $tables_total,
            ],
            "current_table" => $progress_current_table,
        ];
        // These values come from the table list, not the saved resume position.
        unset($cursor_data["current_table_number"], $cursor_data["tables_before_current"], $cursor_data["tables_total"], $cursor_data["current_table_rows_estimated"]);
        $cursor_data["rows_in_batch"] = $this->rows_in_batch;
        $cursor_data["current_insert_has_nonzero_srid_context"] =
            $this->current_insert_has_nonzero_srid_context;
        /**
         * Tracking for rows that are larger than max_allowed_packet or
         * max_statement_size.
         */
        $cursor_data["oversized_queue"] = $this->encode_oversized_queue_for_cursor($this->oversized_queue);
        $cursor_data["current_statement_size"] = $this->current_statement_size;
        $cursor_data["spatial_staging_table_created"] = $this->spatial_staging_table_created;
        $cursor_data["staged_spatial_columns"] = [];
        foreach ($this->staged_spatial_columns as $column => $staged_spatial_column) {
            $cursor_data["staged_spatial_columns"][] = [
                "column" => $column,
                "staging_id" => $staged_spatial_column["staging_id"],
                "chunk_count" => $staged_spatial_column["chunk_count"],
            ];
        }
        $cursor_data["nullable_spatial_columns"] = $this->nullable_spatial_columns;
        $cursor_data["pending_nullable_spatial_columns"] = $this->pending_nullable_spatial_columns;

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
            if ($this->row_reader->is_spatial_type($item['data_type'])) {
                if (!isset($item['spatial_staging_id']) || (int) $item['spatial_staging_id'] < 1) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: an oversized spatial value requires a positive staging id"
                    );
                }
                $decoded_item['spatial_staging_id'] = (int) $item['spatial_staging_id'];
                if (!isset($item['chunk_number']) || (int) $item['chunk_number'] < 0) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: an oversized spatial value requires a chunk number"
                    );
                }
                $decoded_item['chunk_number'] = (int) $item['chunk_number'];
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
            $current_insert_has_nonzero_srid_context =
                $cursor_data["current_insert_has_nonzero_srid_context"] ?? false;
            if (!is_bool($current_insert_has_nonzero_srid_context)) {
                throw new \InvalidArgumentException(
                    "Invalid cursor: current_insert_has_nonzero_srid_context must be boolean"
                );
            }
            $this->current_insert_has_nonzero_srid_context =
                $current_insert_has_nonzero_srid_context;

            $encoded_queue = $cursor_data["oversized_queue"] ?? [];
            $this->oversized_queue = $this->decode_oversized_queue_from_cursor($encoded_queue);
            $this->oversized_pk_values = null;
            if (
                $this->state === self::STATE_STAGE_OVERSIZED_SPATIAL ||
                $this->state === self::STATE_EMIT_OVERSIZED_UPDATE
            ) {
                // The last emitted primary key identifies the row whose
                // oversized values are being staged or appended.
                $this->oversized_pk_values = $this->row_reader->decode_database_values_from_cursor(
                    $cursor_data["last_pk_values"] ?? null
                );
            }
            $this->current_statement_size = $cursor_data["current_statement_size"] ?? 0;
            $this->spatial_staging_table_created =
                (bool) ( $cursor_data["spatial_staging_table_created"] ?? false );
            $staged_spatial_columns = $cursor_data["staged_spatial_columns"] ?? [];
            if (!is_array($staged_spatial_columns)) {
                throw new \InvalidArgumentException(
                    "Invalid cursor: staged_spatial_columns must be an array"
                );
            }
            $this->staged_spatial_columns = [];
            $staging_ids = [];
            foreach ($staged_spatial_columns as $staged_spatial_column) {
                if (
                    !is_array($staged_spatial_column) ||
                    !isset(
                        $staged_spatial_column["column"],
                        $staged_spatial_column["staging_id"],
                        $staged_spatial_column["chunk_count"]
                    ) ||
                    !is_string($staged_spatial_column["column"]) ||
                    $staged_spatial_column["column"] === "" ||
                    (int) $staged_spatial_column["staging_id"] < 1 ||
                    (int) $staged_spatial_column["chunk_count"] < 1
                ) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: each staged spatial column requires a name, positive id, " .
                        "and positive chunk count"
                    );
                }
                $column = $staged_spatial_column["column"];
                $staging_id = (int) $staged_spatial_column["staging_id"];
                if (
                    isset($this->staged_spatial_columns[$column]) ||
                    isset($staging_ids[$staging_id])
                ) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: staged spatial column names and ids must be unique"
                    );
                }
                $this->staged_spatial_columns[$column] = [
                    "staging_id" => $staging_id,
                    "chunk_count" => (int) $staged_spatial_column["chunk_count"],
                ];
                $staging_ids[$staging_id] = true;
            }
            foreach ($this->oversized_queue as $oversized_value) {
                if (!$this->row_reader->is_spatial_type($oversized_value["data_type"])) {
                    continue;
                }
                $staging_id = $oversized_value["spatial_staging_id"];
                if (isset($staging_ids[$staging_id])) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: oversized spatial staging ids must be unique"
                    );
                }
                $staging_ids[$staging_id] = true;
            }
            $this->nullable_spatial_columns = $this->decode_spatial_columns_from_cursor(
                $cursor_data["nullable_spatial_columns"] ?? [],
                "nullable_spatial_columns"
            );
            $this->pending_nullable_spatial_columns = $this->decode_spatial_columns_from_cursor(
                $cursor_data["pending_nullable_spatial_columns"] ?? [],
                "pending_nullable_spatial_columns"
            );

            if (!$this->row_reader->restore_cursor_state($cursor_data)) {
                $this->state = self::STATE_INIT;
                $this->nullable_spatial_columns = [];
                $this->pending_nullable_spatial_columns = [];
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
                // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Cursor errors are returned as plain API messages.
                foreach (array_merge(
                    $this->nullable_spatial_columns,
                    $this->pending_nullable_spatial_columns
                ) as $column) {
                    $column_metadata = $this->row_reader->get_column_metadata($column);
                    if (!$this->row_reader->is_spatial_type($column_metadata["data_type"])) {
                        throw new \RuntimeException(
                            "Cannot restore the database row cursor because column " .
                            $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                            "." . $this->row_reader->quote_identifier($column) .
                            " is no longer spatial. Run db-pull --abort and start again."
                        );
                    }
                }
                if (
                    $this->state === self::STATE_EMIT_NULLABLE_SPATIAL_COLUMNS &&
                    empty($this->pending_nullable_spatial_columns)
                ) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: emit_nullable_spatial_columns requires pending columns"
                    );
                }
                if (
                    $this->state !== self::STATE_EMIT_NULLABLE_SPATIAL_COLUMNS &&
                    !empty($this->pending_nullable_spatial_columns)
                ) {
                    throw new \InvalidArgumentException(
                        "Invalid cursor: pending nullable spatial columns require " .
                        "the emit_nullable_spatial_columns state"
                    );
                }
                // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
            }
        }
    }

    /** Validates a list of spatial column names read from a cursor. */
    private function decode_spatial_columns_from_cursor($columns, $cursor_field)
    {
        // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Cursor errors are returned as plain API messages.
        if (!is_array($columns)) {
            throw new \InvalidArgumentException("Invalid cursor: {$cursor_field} must be an array");
        }
        $decoded = [];
        foreach ($columns as $column) {
            if (!is_string($column) || $column === "") {
                throw new \InvalidArgumentException(
                    "Invalid cursor: {$cursor_field} must contain non-empty column names"
                );
            }
            if (in_array($column, $decoded, true)) {
                throw new \InvalidArgumentException(
                    "Invalid cursor: {$cursor_field} contains duplicate column '{$column}'"
                );
            }
            $decoded[] = $column;
        }
        // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        return $decoded;
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

        if ($value === "" && $this->row_reader->is_spatial_type($data_type)) {
            return "NULLIF(1, 1 " . self::ZERO_BYTE_SPATIAL_VALUE_COMMENT . ")";
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

        if ($value === "" && $this->row_reader->is_spatial_type($data_type)) {
            return strlen("NULLIF(1, 1 " . self::ZERO_BYTE_SPATIAL_VALUE_COMMENT . ")");
        }

        $len = strlen((string) $value);
        if ($len === 0) {
            return 2; // ''
        }

        /** Base64 output is always ceil(n/3)*4 bytes. */
        $estimated_base64_length = 4 * Utils::integer_divide($len + 2, 3);
        // FROM_BASE64('<data>') adds 15 bytes. JSON adds the surrounding
        // CONVERT(... USING utf8mb4), for 38 wrapper bytes in total.
        $wrapper_bytes = strtoupper($data_type) === "JSON" ? 38 : 15;
        return $wrapper_bytes + $estimated_base64_length;
    }

    /** Estimates a non-null binary value from its raw byte length. */
    private function estimate_formatted_binary_size($byte_length)
    {
        if ($byte_length === 0) {
            return strlen("NULLIF(1, 1 " . self::ZERO_BYTE_SPATIAL_VALUE_COMMENT . ")");
        }
        return 15 + 4 * Utils::integer_divide($byte_length + 2, 3);
    }

    /** Returns the source max_allowed_packet value, or null when it cannot be read. */
    private function detect_max_allowed_packet()
    {
        try {
            $result = $this->db->query("SELECT @@max_allowed_packet as max_allowed_packet");
            $row = $result->fetch(PdoConstants::fetch_assoc());
            if ($row && isset($row['max_allowed_packet'])) {
                return (int) $row['max_allowed_packet'];
            }
        } catch (\Exception $e) {
        }

        return null;
    }

    /**
     * Formats a row as a VALUES tuple, splitting oversized columns if needed.
     *
     * The approach is estimate-first: compute the approximate encoded size of
     * each column before doing the actual (expensive) base64 encoding. If the
     * row fits the statement and part-body limits, encode everything. If it
     * doesn't, replace eligible large non-PK text and binary columns with ''
     * and queue their real values as UPDATE ... CONCAT() chunks. Spatial
     * values use scalar subqueries after their complete bytes are staged.
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
            if ($this->row_reader->is_spatial_type($data_type)) {
                $spatial_value_length = $this->row_reader->get_current_spatial_value_length($col);
                if (
                    $spatial_value_length !== null &&
                    $spatial_value_length > $this->target_max_allowed_packet
                ) {
                    // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
                    throw new \RuntimeException(
                        "Spatial column " .
                        $this->row_reader->quote_identifier($this->row_reader->get_current_table()) . "." .
                        $this->row_reader->quote_identifier($col) .
                        " is {$spatial_value_length} bytes, but the target max_allowed_packet is " .
                        "{$this->target_max_allowed_packet} bytes. Increase the target limit and start again."
                    );
                    // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
                }
                $estimated_sizes[$col] = $spatial_value_length === null
                    ? 4
                    : $this->estimate_formatted_binary_size($spatial_value_length);
            } else {
                $estimated_sizes[$col] = $this->estimate_formatted_size($value, $data_type);
            }
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
                if (
                    $this->row_reader->is_spatial_type($data_type) &&
                    $this->row_reader->get_current_spatial_value_length($col) > 0 &&
                    $raw_values[$col] === null
                ) {
                    throw new \LogicException(
                        "A spatial value omitted from the row query cannot use a direct INSERT."
                    );
                }
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
        $chunked_replacements = [];
        $next_spatial_staging_id = 1;

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

            $data_type = $this->row_reader->get_data_type($col);
            $normalized_data_type = strtoupper($data_type);
            $spatial_type = $this->row_reader->is_spatial_type($normalized_data_type);
            $raw_value = $raw_values[$col];
            $spatial_value_length = $spatial_type
                ? $this->row_reader->get_current_spatial_value_length($col)
                : null;
            if (
                ( !$spatial_type && ( $raw_value === null || $raw_value === '' ) ) ||
                ( $spatial_type &&
                    ( $spatial_value_length === null || $spatial_value_length === 0 ) )
            ) {
                continue;
            }
            if (
                !$this->row_reader->is_binary_type($normalized_data_type) &&
                !$this->row_reader->is_character_string_type($normalized_data_type) &&
                !$spatial_type
            ) {
                $unchunkable_data_types[$normalized_data_type] = true;
                continue;
            }
            $value_length = $spatial_type
                ? $spatial_value_length
                : strlen($raw_value);
            $replacement = "''";
            $staging_id = 0;
            if ($spatial_type) {
                $staged_spatial_column = $this->staged_spatial_columns[$col] ?? null;
                $staging_id = $staged_spatial_column["staging_id"] ??
                    $next_spatial_staging_id;
                $quoted_staging_table = $this->row_reader->quote_identifier(
                    self::SPATIAL_STAGING_TABLE
                );
                $chunk_count = $staged_spatial_column["chunk_count"] ??
                    (int) ceil($value_length / $this->compute_chunk_size($col));
                $chunk_selects = [];
                for ($chunk_number = 0; $chunk_number < $chunk_count; ++$chunk_number) {
                    $chunk_selects[] =
                        "(SELECT `value` FROM {$quoted_staging_table} " .
                        "WHERE `id` = {$staging_id} AND `chunk_number` = {$chunk_number})";
                }
                $replacement = "CONCAT(" . implode(",", $chunk_selects) . ")";
                $chunked_replacements[$col] = $replacement;
                ++$next_spatial_staging_id;
            }
            $chunked_columns[$col] = true;
            $replacement_bytes = strlen($replacement);
            $saved_bytes += $size - $replacement_bytes;
            $excess -= $size - $replacement_bytes;

            $queue_item = [
                'column' => $col,
                'data_type' => $data_type,
                'byte_offset' => 0,
                'total_length' => $value_length,
            ];
            if ($this->row_reader->is_character_string_type($data_type)) {
                $queue_item['character_offset'] = 0;
            }
            if ($spatial_type && !isset($this->staged_spatial_columns[$col])) {
                $queue_item['spatial_staging_id'] = $staging_id;
                $queue_item['chunk_number'] = 0;
            }
            if (!$spatial_type || !isset($this->staged_spatial_columns[$col])) {
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
                $formatted_values[$col] = $chunked_replacements[$col] ?? "''";
                continue;
            }
            $data_type = $this->row_reader->get_data_type($col);
            $formatted_values[$col] = $this->format_value($raw_values[$col], $data_type);
        }

        return "(" . implode(",", array_values($formatted_values)) . ")";
    }

    /**
     * Finds spatial values which need an import-time spatial rule check.
     *
     * A spatial reference system identifier (SRID) tells a database how to
     * interpret a geometry's coordinates. MySQL and MariaDB store that number
     * in the first four bytes of their internal geometry value. Reprint can copy
     * SRID 0 directly. A nonzero SRID needs an extra check because one server may
     * apply a registered spatial reference definition while the other stores the
     * same SRID only as a number. In that case the coordinate order may change.
     *
     * SQL NULL and MariaDB's zero-byte spatial placeholder have no SRID to check.
     * Large spatial values are not held in $row, so their retained four-byte
     * prefix is read from DatabaseRowsReader instead.
     *
     * @param array<string,mixed> $row Current source row keyed by column name.
     * @return array<int,array{0:string,1:int}> Pairs containing the spatial
     *         column name and its nonzero SRID.
     */
    private function get_nonzero_srid_values($row)
    {
        $values = [];
        foreach ($this->row_reader->get_current_spatial_value_lengths() as $column => $byte_length) {
            $value = $row[$column] ?? null;
            if ($byte_length === null || $byte_length === 0) {
                continue;
            }
            if (is_string($value) && strlen($value) >= 4) {
                $prefix = substr($value, 0, 4);
            } elseif ($value === null && $byte_length >= 4) {
                $prefix = $this->row_reader->get_current_oversized_spatial_value_prefix($column);
                if (!is_string($prefix) || strlen($prefix) !== 4) {
                    // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error returned as authenticated API data, never HTML.
                    throw new \RuntimeException(
                        'Cannot read the SRID for oversized spatial column ' .
                        $this->row_reader->quote_identifier($this->row_reader->get_current_table()) .
                        '.' . $this->row_reader->quote_identifier($column) . '.'
                    );
                    // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
                }
            } else {
                continue;
            }
            $unpacked = unpack('Vsrid', $prefix);
            $srid = is_array($unpacked) ? (int) $unpacked['srid'] : 0;
            if ($srid === 0) {
                continue;
            }
            $values[] = [$column, $srid];
        }
        return $values;
    }

    /**
     * Builds the SQL marker used to check a nonzero SRID before import.
     *
     * The marker is a versioned JSON comment placed immediately before the first
     * affected VALUES tuple. It names the table, the row's primary key, and every
     * nonzero-SRID column in that row. The importer can then report the exact row
     * and decide whether the source and target use compatible spatial rules,
     * without parsing the INSERT itself.
     *
     * @param array<string,mixed> $row Current source row keyed by column name.
     * @return string The complete SQL comment, or an empty string when the row
     *         has no nonzero SRID.
     */
    private function format_nonzero_srid_comment($row)
    {
        $spatial_values = $this->get_nonzero_srid_values($row);
        if ($spatial_values === []) {
            return '';
        }

        $primary_key = [];
        foreach ($this->row_reader->get_current_primary_key_columns() ?: [] as $column) {
            $value = $row[$column] ?? null;
            if ($value === null) {
                $display_value = 'NULL';
            } elseif (
                $this->row_reader->is_numeric_type($this->row_reader->get_data_type($column)) &&
                is_numeric($value)
            ) {
                $display_value = (string) $value;
            } else {
                $display_value = json_encode(
                    (string) $value,
                    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
                );
                if ($display_value === false) {
                    $display_value = 'base64:' . base64_encode( (string) $value );
                }
            }
            $primary_key[] = [
                'column' => $column,
                'display_value' => $display_value,
            ];
        }
        $spatial_columns = [];
        foreach ($spatial_values as $spatial_value) {
            $spatial_columns[] = [
                'column' => $spatial_value[0],
                'srid' => $spatial_value[1],
            ];
        }
        // One marker is enough to stop the entire INSERT. Naming only its first
        // affected row also keeps the diagnostic within the SQL statement limit.
        $context = [
            'table' => $this->row_reader->get_current_table(),
            'primary_key' => $primary_key,
            'spatial_columns' => $spatial_columns,
        ];
        $context_json = json_encode($context);
        if ($context_json === false) {
            throw new \RuntimeException('Cannot encode spatial statement context.');
        }
        return self::NONZERO_SRID_COMMENT_PREFIX .
            self::NONZERO_SRID_CONTEXT_VERSION . ' ' .
            $context_json . ' */';
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
            $data_type = $this->row_reader->get_data_type($column);
            if ($this->row_reader->is_spatial_type($data_type)) {
                $spatial_value_length = $this->row_reader->get_current_spatial_value_length($column);
                $tuple_bytes += $spatial_value_length === null
                    ? 4
                    : $this->estimate_formatted_binary_size($spatial_value_length);
            } else {
                $tuple_bytes += $this->estimate_formatted_size(
                    $row[$column] ?? null,
                    $data_type
                );
            }
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
            $size += strlen($this->row_reader->build_comparison($col, $value, "=", false));
            $size += 5; // AND
        }

        return (int)$size;
    }

    /** Builds complete spatial values before their target row is inserted. */
    private function stage_oversized_spatial_value()
    {
        $spatial_queue_index = null;
        foreach ($this->oversized_queue as $queue_index => $queue_item) {
            if ($this->row_reader->is_spatial_type($queue_item['data_type'])) {
                $spatial_queue_index = $queue_index;
                break;
            }
        }

        if ($spatial_queue_index === null) {
            // The row is re-formatted after staging. That pass rebuilds any
            // text and binary updates which must run after the INSERT.
            $this->oversized_queue = [];
            if ($this->row_reader->get_current_record() === null) {
                $this->row_reader->reload_current_record($this->oversized_pk_values);
            }
            $this->state = self::STATE_START_INSERT;
            return false;
        }

        $current = $this->oversized_queue[$spatial_queue_index];
        $staging_id = $current['spatial_staging_id'];
        $quoted_staging_table = $this->row_reader->quote_identifier(
            self::SPATIAL_STAGING_TABLE
        );

        if (!$this->spatial_staging_table_created) {
            $this->current_sql_fragment =
                "CREATE TABLE IF NOT EXISTS {$quoted_staging_table} (" .
                "`id` INT UNSIGNED NOT NULL," .
                "`chunk_number` INT UNSIGNED NOT NULL," .
                "`value` LONGBLOB NOT NULL," .
                "PRIMARY KEY (`id`, `chunk_number`)" .
                ") ENGINE=InnoDB;";
            $this->spatial_staging_table_created = true;
            return true;
        }

        if ($current['byte_offset'] >= $current['total_length']) {
            $this->staged_spatial_columns[$current['column']] = [
                "staging_id" => $staging_id,
                "chunk_count" => $current['chunk_number'],
            ];
            unset($this->oversized_queue[$spatial_queue_index]);
            $this->oversized_queue = array_values($this->oversized_queue);
            return false;
        }

        $chunk = $this->read_next_oversized_chunk($current);
        $formatted_chunk = $this->format_value($chunk['value'], 'LONGBLOB');
        $this->current_sql_fragment =
            "REPLACE INTO {$quoted_staging_table} (`id`, `chunk_number`, `value`) " .
            "VALUES ({$staging_id}, {$current['chunk_number']}, {$formatted_chunk});";
        $this->oversized_queue[$spatial_queue_index]['byte_offset'] += $chunk['byte_length'];
        ++$this->oversized_queue[$spatial_queue_index]['chunk_number'];
        return true;
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

        if ($this->row_reader->is_spatial_type($data_type)) {
            throw new \LogicException(
                "Spatial values must be complete before their target row is inserted."
            );
        }

        $chunk = $this->read_next_oversized_chunk($current);
        $formatted_chunk = $this->format_value($chunk['value'], $data_type);

        // The target row is already selected. Its membership records may not
        // have been imported yet, so only its primary key belongs in this UPDATE.
        // Keep destination keys in base64 so URL rewriting also reaches these comparisons.
        $where_parts = [];
        foreach ($this->oversized_pk_values as $pk_col => $pk_value) {
            $where_parts[] = $this->row_reader->build_comparison($pk_col, $pk_value, "=", false);
        }
        $where_clause = implode(" AND ", $where_parts);

        $quoted_table = $this->row_reader->quote_identifier($this->row_reader->get_current_table());
        $quoted_column = $this->row_reader->quote_identifier($column);
        $this->current_sql_fragment =
            "UPDATE {$quoted_table} SET {$quoted_column} = " .
            "CONCAT({$quoted_column}, {$formatted_chunk}) WHERE {$where_clause};";

        $this->oversized_queue[0]['byte_offset'] += $chunk['byte_length'];
        if ($chunk['character_string']) {
            $this->oversized_queue[0]['character_offset'] += $chunk['value_length'];
        }
        if ($this->oversized_queue[0]['byte_offset'] >= $total_length) {
            array_shift($this->oversized_queue);
        }

        return true;
    }

    /**
     * Reads and validates one bounded piece of an oversized source value.
     *
     * @param array $current {
     *     Oversized value progress.
     *
     *     @type string $column           Column name.
     *     @type string $data_type        Column data type.
     *     @type int    $byte_offset      Next byte offset.
     *     @type int    $total_length     Complete value length in bytes.
     *     @type int    $character_offset Next character offset for text values.
     * }
     * @return array {
     *     The next bounded source piece.
     *
     *     @type string $value            Raw bytes.
     *     @type int    $byte_length      Raw byte length.
     *     @type int    $value_length     Character or byte length used by the source range.
     *     @type bool   $character_string Whether the source range counts characters.
     * }
     */
    private function read_next_oversized_chunk($current)
    {
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
                Utils::integer_divide(
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
        $chunk_bytes = strlen($chunk_result['value']);

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

        return [
            'value' => $chunk_result['value'],
            'byte_length' => $chunk_bytes,
            'value_length' => $chunk_result['value_length'],
            'character_string' => $character_string,
        ];
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

        $where_parts = $this->row_reader->get_current_row_selection_conditions(true);
        foreach ($this->oversized_pk_values as $pk_col => $pk_value) {
            $where_parts[] = $this->row_reader->build_comparison($pk_col, $pk_value, "=");
        }
        $where_clause = implode(" AND ", $where_parts);

        $value_expression = $character_string
            ? "SUBSTRING({$quoted_column}, {$start}, {$length})"
            : "SUBSTRING(CAST({$quoted_column} AS BINARY), {$start}, {$length})";
        $sql = $this->row_reader->get_select_prefix() . " CAST({$value_expression} AS BINARY) AS value_chunk,"
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

    /** Returns whether this row still has a spatial value to build before insertion. */
    private function has_pending_spatial_staging()
    {
        foreach ($this->oversized_queue as $queue_item) {
            if ($this->row_reader->is_spatial_type($queue_item['data_type'])) {
                return true;
            }
        }
        return false;
    }
}
