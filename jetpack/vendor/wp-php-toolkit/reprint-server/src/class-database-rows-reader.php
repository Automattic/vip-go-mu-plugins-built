<?php

namespace WordPress\Reprint\Server;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Database cursor errors are never HTML.

/**
 * Reads database rows through bounded, resumable, primary-key-ordered queries.
 */
class DatabaseRowsReader {

    /** Prefix shared by every schema version of Reprint's internal MySQL progress table. */
    private const MYSQL_IMPORT_PROGRESS_TABLE_PREFIX = "__reprint_db_pull_progress_";


    /** @var mixed PDO or a PDO-compatible adapter. */
    private $db;

    /** @var bool|null Whether source comparisons can decode base64, checked on first use. */
    private $supports_from_base64 = null;

    /** @var array|null */
    private $current_pk_columns = null;

    /**
     * Primary key of the last returned record or completed candidate batch.
     * For selected-site user reads, an empty filtered batch still moves this
     * position past every checked ID. The next SELECT starts after it.
     *
     * @var array|null
     */
    private $last_pk_values = null;

    /**
     * Fallback cursor for tables without a primary key. OFFSET pagination
     * re-scans earlier rows and can drift when records are inserted or deleted.
     * Consumers which require stable resume must reject non-empty unkeyed tables.
     *
     * @var int
     */
    private $current_offset = 0;

    /** @var int Rows returned from the current table. */
    private $current_table_rows_processed = 0;

    /** @var string|null */
    private $current_table = null;

    /** @var mixed */
    private $current_result_set = null;

    /**
     * Distinguishes an exhausted LIMIT batch from an empty fresh query. The
     * latter means the current table is complete.
     *
     * @var int
     */
    private $rows_fetched_from_current_query = 0;

    /**
     * Last candidate ID in the open selected-user query, or null without one.
     * For example, a metadata batch may check IDs 1–250 but return only row 7.
     * After returning row 7, consume the query before moving the cursor to 250.
     * This value stays in memory only. Resume reads a new bounded batch after
     * the last returned row; it must not skip candidates that were not consumed.
     *
     * @var int|string|null
     */
    private $current_query_last_candidate_id = null;

    /**
     * Table names mapped to row estimates, or null before table discovery.
     * A selected-site export can also read omitted content tables to collect
     * user IDs. Those tables are included by get_tables_in_current_group(),
     * without adding them to this list of SQL output tables.
     *
     * @var array<int|string, int|null>|null
     */
    private $tables_to_process;

    /** SQL tables before the current table; rebuilt from the table order on resume. */
    private $tables_before_current = 0;

    /**
     * Column metadata cached by table and column name. Each column contains
     * data_type (for example, varchar), column_type (for example,
     * varchar(255)), its nullable collation name, whether it accepts NULL,
     * and its comment.
     *
     * @var array<string,array<string,array{data_type:string,column_type:string,collation:?string,nullable:bool,comment:string}>>
     */
    private $column_type_cache = [];

    /** @var array<string,int> Maximum character bytes cached by collation. */
    private $maximum_character_bytes_by_collation = [];


    /** @var array|null */
    private $current_row = null;

    /** @var bool */
    private $current_row_ends_query_batch = false;

    /** @var array|null */
    private $current_column_types = null;

    /** @var array|null */
    private $current_column_names = null;

    /** @var int */
    private $batch_size;

    /** @var string SET labels by default; unsigned masks only when requested. */
    private $set_value_format;

    /** @var string|null Character set MySQL uses for table definitions. */
    private $metadata_character_set = null;

    /** @var string|null Hidden SELECT field naming a SET column whose label cannot be exported. */
    private $invalid_set_column_alias = null;

    /** @var int|null */
    private $query_time_limit_ms = null;

    /** @var int|null Largest spatial value returned by the ordered row query. */
    private $maximum_inline_spatial_bytes = null;

    /** @var array<string,int|null> Byte lengths for spatial values in the retained row. */
    private $current_spatial_value_lengths = [];

    /** @var array<string,string|null> Four-byte SRID prefixes for omitted spatial values. */
    private $current_oversized_spatial_value_prefixes = [];

    /** @var array<string,string> Internal length aliases keyed by spatial column name. */
    private $spatial_length_aliases = [];

    /** @var array<string,string> Internal SRID-prefix aliases keyed by spatial column name. */
    private $spatial_prefix_aliases = [];

    /** @var array<string,list<array{column:string,value:string}>> Row exclusions keyed by table. */
    private $exclude_rows_by_table = [];

    /** @var string[] Table names omitted from automatic discovery. */
    private $exclude_tables = [];


    /**
     * Rules for the tables and rows that this reader can export for one site.
     *
     * For site 7 with base prefix `network_`, this selects `network_7_posts`
     * and other core site tables. It limits shared `network_users` and
     * `network_usermeta` rows to this site's members and users named in its
     * posts, comments and links.
     * The SQL endpoint builds the selection from server-side WordPress state.
     * This object does not check who sent the request.
     *
     * Null means no selected-site rules; normal table and row filters still apply.
     *
     * @var MultisiteDatabaseSelection|null
     */
    private $multisite_selection;

    /**
     * Which table list to use: 'content' or 'users'.
     * For a selected-site export, the producer selects 'users' when all content
     * tables are complete. It then collects site members before reading the
     * users and usermeta tables. Other exports use only the 'content' list.
     *
     * @var string
     */
    private $table_group = 'content';

    /**
     * Last network usermeta primary key checked for site membership.
     * For site 7, a batch ending at umeta_id 500 saves '500' even if no row
     * has the `network_7_capabilities` key. Resume starts after row 500.
     * A decimal string preserves large MySQL IDs without a PHP integer cast.
     *
     * @var string
     */
    private $last_scanned_usermeta_id = '0';

    /**
     * Initializes the bounded database row reader.
     *
     * @param mixed $db PDO or a PDO-compatible adapter.
     * @param array $options {
     *     Reader options.
     *
     *     @type array|null $tables_to_process   Tables to read, or null to discover them.
     *     @type string     $set_value_format    label (default) or unsigned; SQLite always reads labels.
     *     @type int        $batch_size          Maximum records per query.
     *     @type int|null   $query_time_limit_ms Maximum query duration in milliseconds.
     *     @type int|null   $maximum_inline_spatial_bytes Largest spatial value returned inline.
     *     @type array      $exclude_rows        Table, column, and value exclusion rules.
     *     @type string[]   $exclude_tables      Table names to omit from automatic discovery.
     *     @type MultisiteDatabaseSelection $multisite_selection Site table and row rules built from source WordPress state.
     * }
     */
    public function __construct($db, $options = [])
    {
        $this->db = $db;
        $this->set_value_format = array_key_exists("set_value_format", $options) ? $options["set_value_format"] : "label";
        if (!in_array($this->set_value_format, ["label", "unsigned"], true)) {
            throw new \InvalidArgumentException(
                "set_value_format must be label or unsigned; received " . json_encode($this->set_value_format) . "."
            );
        }
        $this->multisite_selection = $options["multisite_selection"] ?? null;
        if ($this->multisite_selection !== null && !$this->multisite_selection instanceof MultisiteDatabaseSelection) {
            throw new \InvalidArgumentException("multisite_selection must be a trusted MultisiteDatabaseSelection object.");
        }
        if ($this->multisite_selection !== null) {
            // Selection options may be reused by a caller. Each reader retains
            // its own request lock and generation, never mutable shared state.
            $this->multisite_selection = clone $this->multisite_selection;
        }
        $this->tables_to_process = $options["tables_to_process"] ?? null;
        if ($this->tables_to_process !== null) {
            // A table name identifies the resume position, so visit each name once.
            $this->tables_to_process = array_values(array_unique(array_filter($this->tables_to_process, function ($table) {
                return !MultisiteDatabaseSelection::is_internal_table($table);
            })));
        }
        if ($this->multisite_selection !== null && $this->tables_to_process !== null) {
            $this->tables_to_process = array_values(array_filter(
                $this->tables_to_process,
                [$this->multisite_selection, 'includes_table']
            ));
        }
        if ($this->tables_to_process !== null) {
            $this->tables_to_process = array_fill_keys($this->tables_to_process, null);
        }
        $this->batch_size = max(1, (int) ( $options["batch_size"] ?? 250 ));
        $this->exclude_tables = array_values(array_filter(
            $options["exclude_tables"] ?? [],
            "is_string"
        ));

        if (isset($options["query_time_limit_ms"])) {
            $limit = (int) $options["query_time_limit_ms"];
            $this->query_time_limit_ms = $limit > 0 ? $limit : null;
        }

        if (isset($options["maximum_inline_spatial_bytes"])) {
            $this->maximum_inline_spatial_bytes = max(
                1,
                (int) $options["maximum_inline_spatial_bytes"]
            );
        }

        if (isset($options["exclude_rows"]) && is_array($options["exclude_rows"])) {
            foreach ($options["exclude_rows"] as $rule) {
                if (
                    !is_array($rule) ||
                    !isset($rule["table"], $rule["column"], $rule["value"]) ||
                    !is_string($rule["table"]) ||
                    !is_string($rule["column"]) ||
                    !is_string($rule["value"])
                ) {
                    continue;
                }
                $this->exclude_rows_by_table[$rule["table"]][] = [
                    "column" => $rule["column"],
                    "value" => $rule["value"],
                ];
            }
        }
        if ($this->multisite_selection !== null && !isset($options['cursor'])) {
            $this->multisite_selection->open_user_set($this->db, null);
        }
    }

    /**
     * Switches to users and usermeta after all content tables are complete.
     *
     * The producer calls this when a table list ends, not for each table.
     * This only changes $table_group. The producer must finish
     * collect_site_members_step() before it calls move_to_next_table()
     * to read the first user table.
     *
     * @return bool True when the user table group was selected. False when no
     *              selected-site rules apply, no user table was requested,
     *              or this group was already selected.
     */
    public function start_user_tables(): bool
    {
        if ($this->multisite_selection === null || $this->table_group === 'users') {
            return false;
        }
        if (!$this->multisite_selection->get_user_tables($this->get_selected_table_names())) {
            return false;
        }
        $this->table_group = 'users';
        return true;
    }

    /**
     * Reads one batch of network usermeta rows and saves this site's member IDs.
     *
     * Read IDs and keys, not profile values. Filtering capabilities before
     * LIMIT could scan millions of unrelated rows in one step. Persist the
     * last scanned umeta_id even when none of the batch belongs to this site.
     * For site 7 with base prefix `network_`, read `network_usermeta` and
     * save user IDs only for rows with meta_key `network_7_capabilities`.
     *
     * @return bool True when a batch was read, even if it had no site members.
     *              False when no rows remain after the saved umeta_id.
     */
    public function collect_site_members_step(): bool
    {
        $table = $this->multisite_selection->get_usermeta_table_name();
        $query = $this->get_select_prefix() . " umeta_id, user_id, meta_key FROM `{$table}` WHERE umeta_id > {$this->last_scanned_usermeta_id} ORDER BY umeta_id LIMIT {$this->batch_size}";
        $last_id = $this->multisite_selection->collect_user_references($table, $query);
        if ($last_id === '0') {
            return false;
        }
        $this->last_scanned_usermeta_id = $last_id;
        return true;
    }

    /**
     * Returns how the producer must read the current table; does not read rows.
     *
     * Content omitted from SQL can still identify users to migrate.
     * Row exclusions likewise do not remove a user's connection to the site.
     *
     * For example, a users-only export visits `network_7_posts` in user_ids
     * mode. If posts are selected but some rows are excluded, and users or
     * usermeta are requested, user_ids_then_rows keeps all authors before
     * exporting only the permitted post rows.
     *
     * @return string 'rows' for normal SQL output; 'user_ids' for an omitted
     *                content table; 'user_ids_then_rows' for all content IDs
     *                followed by SQL output with row exclusions applied.
     */
    public function get_current_table_export_mode(): string
    {
        if (!array_key_exists($this->current_table, $this->tables_to_process)) {
            return 'user_ids';
        }
        if ($this->multisite_selection !== null && isset($this->exclude_rows_by_table[$this->current_table]) &&
            $this->multisite_selection->get_user_tables($this->get_selected_table_names())) {
            $columns = $this->multisite_selection->get_reference_columns($this->current_table);
            if ($columns !== null && $columns['kind'] !== 4) {
                return 'user_ids_then_rows';
            }
        }
        return 'rows';
    }

    /**
     * Saves one batch of content user IDs using the current table's normal cursor.
     *
     * For `network_7_posts`, read only ID and post_author. Save the user IDs
     * in `network_7_reprint_users` before moving the cursor past those posts.
     * No post text or user profiles are read by this step.
     * Row-filtered exports finish this pass before reading the permitted content.
     *
     * @return bool True when a batch was read. False after an empty read, which
     *              resets the table cursor so SQL output can start at its first row.
     */
    public function collect_content_user_ids_step(): bool
    {
        $columns = $this->multisite_selection->get_reference_columns($this->current_table);
        $primary_key = $columns['primary_key'];
        $where = $this->build_comparison($primary_key, $this->last_pk_values[$primary_key] ?? '0', '>');
        $query = $this->get_select_prefix() . " `{$primary_key}`, `{$columns['user_column']}` FROM `{$this->current_table}` WHERE {$where} ORDER BY `{$primary_key}` LIMIT {$this->batch_size}";
        $last_id = $this->multisite_selection->collect_user_references($this->current_table, $query);
        if ($last_id === '0') {
            // The following SQL export, when requested, starts at the first row.
            $this->last_pk_values = null;
            return false;
        }
        $this->last_pk_values = [$primary_key => $last_id];
        return true;
    }

    public function __destruct()
    {
        try {
            $this->close();
        } catch (\Throwable $error) {
            // A dead MySQL connection has already released its named lock.
            // Cleanup must not replace the request's original query failure.
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Record a failed resource cleanup, not debug output.
            error_log('Could not close the SQL row reader: ' . $error->getMessage());
        }
    }

    /** Releases an unfinished bounded query before releasing the source lock. */
    public function close(): void
    {
        $this->release_current_result_set();
        if ($this->multisite_selection !== null) {
            $this->multisite_selection->close();
        }
    }


    /**
     * Fetches a row or finishes one filtered batch, then advances the cursor.
     *
     * Selected-site user reads limit candidate IDs before applying filters.
     * An empty result can therefore mean 250 rejected metadata rows, not EOF.
     * Return control so the producer can emit a checkpoint and stop or resume.
     * Other reads open the next LIMIT query when the previous one is consumed.
     *
     * @param array<string,string>|null $column_expressions Trusted SQL expressions
     *     keyed by result column. Push uses these to bound row bytes and export
     *     ENUM indexes and WKB. Raw primary keys are read separately for the
     *     cursor, so an encoded value never changes pagination. Null uses the
     *     normal pull projection. Keep the projection unchanged within a table.
     * @return bool|null True for a row, null after a selected-user batch was
     *                   consumed without a row, false when no candidates remain.
     */
    public function next_record(?array $column_expressions = null)
    {
        $this->current_row_ends_query_batch = false;
        if (!$this->current_result_set) {
            if ($this->multisite_selection !== null && $this->current_table !== null) {
                $columns = $this->multisite_selection->get_reference_columns($this->current_table);
                if ($columns !== null && $columns['kind'] !== 4) {
                    // Save an ID-only projection before the unbuffered content
                    // query. Waiting until its last row would let earlier SQL
                    // cursors leave before their user IDs were durable.
                    $this->multisite_selection->collect_user_references(
                        $this->current_table,
                        $this->build_select_query("`{$columns['primary_key']}`, `{$columns['user_column']}`")
                    );
                }
            }
            $query = $this->multisite_selection !== null && $this->multisite_selection->is_shared_user_table($this->current_table)
                ? $this->read_candidate_ids_and_build_row_query()
                : $this->build_select_query($column_expressions === null ? null : $this->build_custom_projection($column_expressions));
            if ($query === null) {
                return false;
            }
            try {
                $this->current_result_set = $this->db->query($query);
            } catch (\Exception $e) {
                throw new \RuntimeException(
                    "Database query `{$query}` failed for table " . $this->quote_identifier($this->current_table) . ": " . $e->getMessage()
                );
            }
            $this->rows_fetched_from_current_query = 0;
        }

        $record = $this->current_result_set->fetch(PdoConstants::fetch_assoc());
        if (!$record) {
            $this->current_result_set = null;
            if ($this->current_query_last_candidate_id !== null) {
                $this->last_pk_values = [$this->current_pk_columns[0] => $this->current_query_last_candidate_id];
                $this->current_query_last_candidate_id = null;
                $this->clear_current_record();
                return null;
            }
            if ($this->rows_fetched_from_current_query === 0) {
                return false;
            }
            if ($this->last_pk_values !== null || $this->current_offset > 0) {
                return $this->next_record($column_expressions);
            }
            return false;
        }

        $record = $this->check_set_labels($record);
        $record = $this->preserve_floating_point_values($record);
        $primary_key_values = $record;
        if ($column_expressions !== null) {
            $primary_key_values = [];
            foreach ($this->current_pk_columns ?? [] as $index => $column) {
                $alias = $this->get_custom_primary_key_alias($index, $column_expressions);
                $primary_key_values[$column] = $record[$alias];
                unset($record[$alias]);
            }
        }
        $record = $this->check_saved_user_reference($record);
        $record = $this->extract_spatial_value_metadata($record);
        ++$this->rows_fetched_from_current_query;
        if ($this->current_column_names === null) {
            $this->current_column_names = array_keys($record);
        }

        if ($this->current_pk_columns && count($this->current_pk_columns) > 0) {
            $this->last_pk_values = [];
            foreach ($this->current_pk_columns as $column) {
                if (!array_key_exists($column, $primary_key_values)) {
                    throw new \RuntimeException(
                        "Primary key column '{$column}' missing from SELECT result for table " .
                        $this->quote_identifier($this->current_table)
                    );
                }
                $this->last_pk_values[$column] = $primary_key_values[$column];
            }
        } else {
            ++$this->current_offset;
        }
        ++$this->current_table_rows_processed;

        $this->current_row = $record;
        if ($this->rows_fetched_from_current_query >= $this->batch_size) {
            $this->current_row_ends_query_batch = true;
            $this->release_current_result_set();
            $this->current_query_last_candidate_id = null;
        }
        return true;
    }

    /** @param array<string,string> $column_expressions Trusted result expressions. */
    private function build_custom_projection(array $column_expressions): string
    {
        $expressions = [];
        foreach ($column_expressions as $column => $expression) {
            $expressions[] = $expression . ' AS ' . $this->quote_identifier($column);
        }
        foreach ($this->current_pk_columns ?? [] as $index => $column) {
            $identifier = $this->quote_identifier($column);
            $data_type = $this->get_data_type($column);
            $value = $this->is_numeric_type($data_type) ? $this->get_numeric_value_expression($column) : 'CAST(' . $identifier . ' AS BINARY)';
            $expressions[] = $value . ' AS ' . $this->quote_identifier($this->get_custom_primary_key_alias($index, $column_expressions));
        }
        $set_label_check = $this->get_set_label_check_expression(array_keys($column_expressions));
        if ($set_label_check !== null) {
            $expressions[] = $set_label_check;
        }
        return implode(',', $expressions);
    }

    /** @param array<string,string> $column_expressions Result names to avoid. */
    private function get_custom_primary_key_alias(int $index, array $column_expressions): string
    {
        $alias = '__reprint_primary_key_' . $index;
        while (array_key_exists($alias, $column_expressions)) {
            $alias = '_' . $alias;
        }
        return $alias;
    }

    /**
     * Reads one candidate-ID batch and builds the permitted user/profile row query.
     *
     * Users come from the site's saved ID table. Metadata walks the network's
     * umeta_id primary key, including rejected keys. A per-user ORDER BY
     * umeta_id can read and sort every profile row on MyISAM; its user_id index
     * does not contain the primary key as InnoDB's secondary indexes do.
     *
     * The second query uses only these IDs and the primary index. Keep the
     * normal filters and live reference checks, including for oversized rows.
     * Only this bounded ID list is held in PHP; profile values are not read
     * until the second query. Neither query adds or changes a WordPress index.
     *
     * @return string|null SQL for this batch, or null when no candidate IDs remain.
     */
    private function read_candidate_ids_and_build_row_query(): ?string
    {
        $is_usermeta = $this->current_table === $this->multisite_selection->get_usermeta_table_name();
        $primary_key = $is_usermeta ? 'umeta_id' : 'ID';
        $candidate_column = $is_usermeta ? 'umeta_id' : 'user_id';
        $candidate_table = $is_usermeta ? $this->current_table : $this->multisite_selection->get_user_table_name();
        $last_id = $this->last_pk_values[$primary_key] ?? '0';
        if (!is_numeric($last_id)) {
            throw new \InvalidArgumentException("Cannot compare numeric primary key '{$primary_key}': the cursor contains a non-numeric value, " . json_encode($last_id) . '.');
        }
        $last_id = $this->db->quote( (string) $last_id );
        $query = $this->get_select_prefix() . " `{$candidate_column}` FROM `{$candidate_table}` FORCE INDEX (PRIMARY)" .
            " WHERE `{$candidate_column}` > {$last_id} ORDER BY `{$candidate_column}` LIMIT {$this->batch_size}";
        $result = $this->db->query($query);
        $candidate_ids = $result->fetchAll(PdoConstants::fetch_column());
        if (!$candidate_ids) {
            return null;
        }
        $this->current_query_last_candidate_id = end($candidate_ids);
        $quoted_ids = array_map(function ($id) {
            return $this->db->quote( (string) $id );
        }, $candidate_ids);
        $where_conditions = $this->get_current_row_selection_conditions();
        $where_conditions[] = "`{$primary_key}` IN (" . implode(',', $quoted_ids) . ')';
        return $this->build_byte_preserving_select_from_current_table() .
            ' FORCE INDEX (PRIMARY) WHERE ' . implode(' AND ', array_map(function ($condition) {
                return "({$condition})";
            }, $where_conditions)) . " ORDER BY `{$primary_key}`";
    }

    /** Drains unconsumed records and releases the active LIMIT-sized result set. */
    private function release_current_result_set()
    {
        if ($this->current_result_set === null) {
            return;
        }
        $record = $this->current_result_set->fetch(PdoConstants::fetch_assoc());
        while ($record !== false) {
            $record = $this->current_result_set->fetch(PdoConstants::fetch_assoc());
        }
        $this->current_result_set = null;
    }

    /** Returns whether the table list has been initialized. */
    public function has_initialized_tables()
    {
        return $this->tables_to_process !== null;
    }

    /** Returns the table currently being read. */
    public function get_current_table()
    {
        return $this->current_table;
    }

    /** Returns the fetched record retained until its consumer clears it. */
    public function get_current_record()
    {
        return $this->current_row;
    }

    /** Clears the retained record after its consumer has processed it. */
    public function clear_current_record()
    {
        $this->current_row = null;
        $this->current_row_ends_query_batch = false;
        $this->current_spatial_value_lengths = [];
        $this->current_oversized_spatial_value_prefixes = [];
    }

    /** Returns the retained spatial value length, or null for SQL NULL. */
    public function get_current_spatial_value_length($column)
    {
        return $this->current_spatial_value_lengths[$column] ?? null;
    }

    /**
     * Returns byte lengths for every spatial value in the retained row.
     *
     * The row query already records this map while fetching spatial values. Its
     * keys can therefore drive row-level spatial checks without scanning every
     * table column again.
     *
     * @return array<string,int|null> Byte lengths keyed by spatial column name;
     *         SQL NULL is represented by null.
     */
    public function get_current_spatial_value_lengths()
    {
        return $this->current_spatial_value_lengths;
    }

    /** Returns the four-byte SRID prefix retained for an omitted spatial value. */
    public function get_current_oversized_spatial_value_prefix($column)
    {
        return $this->current_oversized_spatial_value_prefixes[$column] ?? null;
    }

    /**
     * Re-fetches the current keyed row without moving the ordered reader.
     *
     * @param array<string,mixed> $primary_key_values Values keyed by primary key column name.
     */
    public function reload_current_record($primary_key_values)
    {
        if (!$this->current_pk_columns || count($primary_key_values) !== count($this->current_pk_columns)) {
            throw new \RuntimeException(
                "Cannot reload the current database row without its complete primary key."
            );
        }

        $where_parts = $this->get_current_row_selection_conditions();
        foreach ($this->current_pk_columns as $column) {
            if (!array_key_exists($column, $primary_key_values)) {
                throw new \RuntimeException(
                    "Cannot reload the current database row because primary key column " .
                    $this->quote_identifier($column) . " is missing."
                );
            }
            $where_parts[] = $this->build_comparison(
                $column,
                $primary_key_values[$column],
                "="
            );
        }

        $query = $this->build_byte_preserving_select_from_current_table() .
            " WHERE " . implode(" AND ", $where_parts) . " LIMIT 1";
        $result = $this->db->query($query);
        $record = $result->fetch(PdoConstants::fetch_assoc());
        if ($record === false) {
            throw new \RuntimeException(
                "Cannot reload the oversized row from table " .
                $this->quote_identifier($this->current_table) .
                ". The source row changed during export; run db-pull --abort and start again."
            );
        }

        $record = $this->check_set_labels($record);
        $record = $this->preserve_floating_point_values($record);
        $record = $this->check_saved_user_reference($record);
        $record = $this->extract_spatial_value_metadata($record);

        $this->current_row = $record;
        $this->current_row_ends_query_batch = false;
    }

    /**
     * Stops lossy SET masks before they enter row data or the saved cursor.
     *
     * @param array<string,mixed> $record Fetched row, including the private SET check.
     * @return array<string,mixed> Row without the private check field.
     */
    private function check_set_labels(array $record): array
    {
        if ($this->invalid_set_column_alias !== null) {
            $column = $record[$this->invalid_set_column_alias];
            unset($record[$this->invalid_set_column_alias]);
            if ($column !== null) {
                throw new \RuntimeException(
                    "Cannot export numeric SET values from " . $this->quote_identifier($this->current_table) . "." .
                    $this->quote_identifier($column) . ": MySQL replaces characters in a source label when exporting its " .
                    $this->metadata_character_set . " table definition. Export stopped to avoid copying a different value."
                );
            }
        }
        return $record;
    }

    /**
     * Keep values and primary-key cursors independent of PHP's precision settings.
     *
     * With precision=3, casting the float 1.2345678901234567 to a string gives
     * '1.23'. JSON can shorten it too when serialize_precision is low. Convert
     * native floats to strings with 17 significant digits before either,
     * including hidden primary-key fields and rows reloaded after resume.
     * Otherwise the copied value changes, and a rounded resume key can select
     * the same row again or skip a nearby key. Already-string values stay intact.
     *
     * @param array<string,mixed> $record Fetched row, including hidden key fields.
     * @return array<string,mixed> Row with native floats written as round-trip decimals.
     */
    private function preserve_floating_point_values(array $record): array
    {
        foreach ($record as $column => $value) {
            if (is_float($value)) {
                // One digit before the point plus 16 after it round-trip binary64.
                // Unlike %g, %e always uses a dot, including on PHP 7.2. Replacing
                // commas is insufficient: some locales use a multibyte separator,
                // and %g emits only its first byte (invalid UTF-8).
                $record[$column] = sprintf('%.16e', $value);
            }
        }
        return $record;
    }

    /**
     * Rejects a changed relationship before SQL or a cursor can expose that row.
     *
     * @param array<string,mixed> $record Row including the private SELECT flag.
     * @return array<string,mixed> WordPress fields only.
     */
    private function check_saved_user_reference(array $record): array
    {
        if (array_key_exists('__reprint_user_reference_valid', $record)) {
            if ( (string) $record['__reprint_user_reference_valid'] !== '1') {
                throw new \RuntimeException('The saved user reference for a row in table ' . $this->current_table . ' changed or is missing. Run db-pull --abort and start again.');
            }
            unset($record['__reprint_user_reference_valid']);
        }
        return $record;
    }

    /** Returns whether the retained record is the final row of its bounded query. */
    public function is_current_record_at_query_batch_boundary()
    {
        return $this->current_row_ends_query_batch;
    }

    /** Returns column names in table order. */
    public function get_current_column_names()
    {
        return $this->current_column_names;
    }

    /** Returns primary key column names in ordinal order. */
    public function get_current_primary_key_columns()
    {
        return $this->current_pk_columns;
    }

    /** Returns the maximum number of rows read by one query. */
    public function get_batch_size()
    {
        return $this->batch_size;
    }

    /**
     * Returns the row reader fields needed to resume at the current position.
     *
     * @return array {
     *     @type string|null $current_table       Current table name.
     *     @type array|null  $current_pk_columns  Current primary key columns.
     *     @type array|null  $last_pk_values      Encoded primary key values.
     *     @type int         $current_offset      Offset for a table without a primary key.
     *     @type int         $current_table_rows_processed Rows returned from the current table.
     *     @type int|null    $current_table_rows_estimated Source metadata estimate, or null when unavailable.
     *     @type int|null    $current_table_number One-based position of the current table.
     *     @type int         $tables_before_current SQL tables before this table, excluding ID-only reads.
     *     @type int         $tables_total        Number of tables selected for export.
     *     @type array|null  $current_row         Encoded retained record.
     *     @type string      $set_value_format    unsigned when requested on MySQL; otherwise label.
     *     @type bool        $current_row_ends_query_batch Whether the retained record ends its query batch.
     *     @type array|null  $current_column_names Current column names.
     *     @type string|null $multisite_selection Rule version, base prefix, network ID and site ID; null without selected-site rules.
     *     @type string|null $multisite_generation Token matched against the saved user table's comment on resume.
     *     @type string      $table_group 'content', or 'users' from the start of membership collection through user export.
     *     @type string      $last_scanned_usermeta_id Last checked umeta_id, including rows for other sites; '0' before the first read.
     * }
     */
    public function get_cursor_state()
    {
        $exports_current_table = $this->current_table !== null
            && array_key_exists($this->current_table, $this->tables_to_process);
        return [
            "multisite_selection" => $this->multisite_selection === null ? null : $this->multisite_selection->get_identity(),
            "multisite_generation" => $this->multisite_selection === null ? null : $this->multisite_selection->get_generation(),
            "table_group" => $this->table_group,
            "last_scanned_usermeta_id" => $this->last_scanned_usermeta_id,
            "current_table" => $this->current_table,
            "set_value_format" => $this->is_numeric_type("SET") ? "unsigned" : "label",
            "current_pk_columns" => $this->current_pk_columns,
            "last_pk_values" => $this->encode_database_values_for_cursor($this->last_pk_values),
            "current_offset" => $this->current_offset,
            "current_table_rows_processed" => $this->current_table_rows_processed,
            "current_table_rows_estimated" => $exports_current_table
                ? $this->tables_to_process[$this->current_table]
                : null,
            "current_table_number" => $exports_current_table ? $this->tables_before_current + 1 : null,
            "tables_before_current" => $this->tables_before_current,
            "tables_total" => count($this->tables_to_process ?? []),
            "current_row" => $this->encode_database_values_for_cursor($this->current_row),
            "current_row_ends_query_batch" => $this->current_row_ends_query_batch,
            "current_column_names" => $this->current_column_names,
        ];
    }

    /**
     * Restores row reader fields from reader cursor data.
     *
     * @param array $cursor_data Reader cursor fields returned by get_cursor_state().
     * @return bool Whether the cursor's current table still exists.
     */
    public function restore_cursor_state($cursor_data)
    {
        $selection_identity = $this->multisite_selection === null ? null : $this->multisite_selection->get_identity();
        if (( $cursor_data["multisite_selection"] ?? null ) !== $selection_identity) {
            throw new \InvalidArgumentException(
                "Cannot resume this database cursor: the selected multisite site changed. Run db-pull --abort and start again."
            );
        }
        if ($this->multisite_selection !== null) {
            $generation = $cursor_data['multisite_generation'] ?? null;
            $table_group = $cursor_data['table_group'] ?? null;
            $last_id = $cursor_data['last_scanned_usermeta_id'] ?? null;
            if (!is_string($generation) || !in_array($table_group, ['content', 'users'], true) ||
                !is_string($last_id) || !preg_match('/^[0-9]{1,20}$/D', $last_id)) {
                throw new \InvalidArgumentException('Cannot resume the selected-site cursor: its table group or membership position is invalid. Run db-pull --abort and start again.');
            }
            $this->multisite_selection->open_user_set($this->db, $generation);
            $this->table_group = $table_group;
            $this->last_scanned_usermeta_id = $last_id;
        }
        $this->current_table = $cursor_data["current_table"] ?? null;
        if ($this->current_table !== null && !is_string($this->current_table)) {
            throw new \InvalidArgumentException(
                "Invalid cursor: current_table must be string or null, got " . gettype($this->current_table)
            );
        }
        $this->current_pk_columns = $cursor_data["current_pk_columns"] ?? null;
        $this->last_pk_values = $this->decode_database_values_from_cursor(
            $cursor_data["last_pk_values"] ?? null
        );
        $this->current_offset = $cursor_data["current_offset"] ?? 0;
        if (!is_int($this->current_offset) && !is_float($this->current_offset)) {
            throw new \InvalidArgumentException(
                "Invalid cursor: current_offset must be numeric, got " . gettype($this->current_offset)
            );
        }
        $this->current_offset = (int) $this->current_offset;
        $this->current_table_rows_processed = $cursor_data["current_table_rows_processed"] ?? 0;
        if (
            !is_int($this->current_table_rows_processed)
            && !is_float($this->current_table_rows_processed)
        ) {
            throw new \InvalidArgumentException(
                "Invalid cursor: current_table_rows_processed must be numeric, got " .
                gettype($this->current_table_rows_processed)
            );
        }
        $this->current_table_rows_processed = (int) $this->current_table_rows_processed;
        if ($this->current_table_rows_processed < 0) {
            throw new \InvalidArgumentException(
                "Invalid cursor: current_table_rows_processed must not be negative"
            );
        }
        $this->current_row = $this->decode_database_values_from_cursor(
            $cursor_data["current_row"] ?? null
        );
        $this->current_row_ends_query_batch = $cursor_data["current_row_ends_query_batch"] ?? false;
        if (!is_bool($this->current_row_ends_query_batch)) {
            throw new \InvalidArgumentException(
                "Invalid cursor: current_row_ends_query_batch must be boolean, got " .
                gettype($this->current_row_ends_query_batch)
            );
        }
        $this->current_column_names = $cursor_data["current_column_names"] ?? null;

        if ($this->tables_to_process === null) {
            $this->initialize_tables_to_process();
        }
        // Content SQL precedes users and profiles, regardless of discovery order.
        // ID-only content reads follow the selected content but do not add SQL tables.
        $table_names = $this->get_selected_table_names();
        $content_tables = $table_names;
        if ($this->multisite_selection !== null) {
            $user_tables = $this->multisite_selection->get_user_tables($table_names);
            $content_tables = array_values(array_diff($table_names, $user_tables));
            $table_names = array_merge($content_tables, $user_tables);
        }
        $position = $this->current_table === null ? false : array_search($this->current_table, $table_names, true);
        $this->tables_before_current = $position !== false
            ? $position
            : ( $this->table_group === 'users' || $this->current_table !== null ? count($content_tables) : 0 );
        if ($this->current_table) {
            if (!in_array($this->current_table, $this->get_tables_in_current_group(), true)) {
                $this->current_table = null;
                return false;
            }
            if ($this->get_primary_key_columns($this->current_table) !== $this->current_pk_columns) {
                throw new \RuntimeException(
                    "Cannot restore the database row cursor because the primary key for table " .
                    $this->quote_identifier($this->current_table) . " changed."
                );
            }
            $this->current_column_types = $this->get_column_types($this->current_table);
            $set_value_format = $this->is_numeric_type("SET") ? "unsigned" : "label";
            $cursor_set_value_format = $cursor_data["set_value_format"] ?? "label";
            if ($cursor_set_value_format !== $set_value_format) {
                foreach ($this->current_column_types as $column => $metadata) {
                    if (strtoupper($metadata["data_type"]) === "SET" &&
                        ( isset($this->last_pk_values[$column]) || isset($this->current_row[$column]) )) {
                        // For SET('2','1'), label '2' means mask 1. Changing
                        // formats would skip or repeat rows. Old cursors have
                        // no marker and contain labels, even if they look numeric.
                        throw new \RuntimeException(
                            "Cannot resume table " . $this->quote_identifier($this->current_table) .
                            ": SET value format changed from " . $cursor_set_value_format . " to " . $set_value_format .
                            ". Abort this database transfer and start again."
                        );
                    }
                }
            }
            if (empty($this->current_column_types)) {
                throw new \RuntimeException(
                    "Table " . $this->quote_identifier($this->current_table) . " was dropped between export requests " .
                    "(no columns found in SHOW FULL COLUMNS)"
                );
            }
            if ($this->current_column_names === null) {
                $this->current_column_names = array_keys($this->current_column_types);
            }
        }
        return true;
    }

    /**
     * Builds the next bounded, byte-preserving SELECT.
     *
     * Non-numeric, non-binary columns are cast to BINARY so MySQL returns raw
     * bytes instead of transcoding them through the connection character set.
     * A latin1 column read through utf8mb4 must retain its original bytes.
     */
    private function build_select_query(?string $reference_columns = null)
    {
        $query = $reference_columns === null
            ? $this->build_byte_preserving_select_from_current_table()
            : $this->get_select_prefix() . ' ' . $reference_columns . ' FROM ' . $this->quote_identifier($this->current_table);

        $where_conditions = $this->get_current_row_selection_conditions();
        if ($this->current_pk_columns && count($this->current_pk_columns) > 0) {
            if ($this->last_pk_values) {
                $where_conditions[] = $this->build_pk_where_clause();
            }
            if ($where_conditions) {
                $query .= " WHERE " . implode(" AND ", array_map(function ($condition) {
                    return "({$condition})";
                }, $where_conditions));
            }
            $order_columns = array_map(function ($column) {
                return $this->build_primary_key_column_expression($column) . " ASC";
            }, $this->current_pk_columns);
            $query .= " ORDER BY " . implode(", ", $order_columns);
            $query .= " LIMIT {$this->batch_size}";
        } else {
            if ($where_conditions) {
                $query .= " WHERE " . implode(" AND ", array_map(function ($condition) {
                    return "({$condition})";
                }, $where_conditions));
            }
            $query .= " LIMIT {$this->batch_size}";
            if ($this->current_offset > 0) {
                // Best-effort pagination for tables without a primary key.
                $query .= " OFFSET {$this->current_offset}";
            }
        }
        return $query;
    }

    /** Builds the byte-preserving SELECT prefix shared by ordered and exact-row reads. */
    private function build_byte_preserving_select_from_current_table()
    {
        $select = $this->get_select_prefix();

        if ($this->current_column_types) {
            $select_parts = [];
            foreach ($this->current_column_types as $column => $column_info) {
                $quoted_column = $this->quote_identifier($column);
                if (
                    $this->maximum_inline_spatial_bytes !== null &&
                    $this->is_spatial_type($column_info["data_type"])
                ) {
                    $length_alias = $this->get_spatial_length_alias($column);
                    $quoted_length_alias = $this->quote_identifier($length_alias);
                    $prefix_alias = $this->get_spatial_prefix_alias($column);
                    $quoted_prefix_alias = $this->quote_identifier($prefix_alias);
                    $binary_value = "CAST({$quoted_column} AS BINARY)";
                    $select_parts[] =
                        "CASE WHEN OCTET_LENGTH({$binary_value}) <= " .
                        $this->maximum_inline_spatial_bytes .
                        " THEN {$binary_value} ELSE NULL END AS {$quoted_column}";
                    $select_parts[] =
                        "OCTET_LENGTH({$binary_value}) AS {$quoted_length_alias}";
                    $select_parts[] =
                        "CASE WHEN OCTET_LENGTH({$binary_value}) > " .
                        $this->maximum_inline_spatial_bytes .
                        " THEN LEFT({$binary_value}, 4) ELSE NULL END AS {$quoted_prefix_alias}";
                    continue;
                }
                if ($this->is_numeric_type($column_info["data_type"])) {
                    $select_parts[] = $this->get_numeric_value_expression($column) . " AS {$quoted_column}";
                } elseif ($this->db instanceof SqliteDriverPDO && PHP_VERSION_ID < 80100) {
                    // Before PHP 8.1, PDO SQLite returns an empty BLOB as NULL.
                    // For example, CAST(permalink_structure AS BINARY) loses an
                    // empty option value. Return SQL text '' for zero bytes, but
                    // keep real NULLs and non-empty binary bytes unchanged.
                    $select_parts[] = "CASE WHEN LENGTH(CAST({$quoted_column} AS BINARY)) = 0 THEN '' " .
                        "ELSE CAST({$quoted_column} AS BINARY) END AS {$quoted_column}";
                } elseif ($this->is_binary_type($column_info["data_type"])) {
                    $select_parts[] = $quoted_column;
                } else {
                    $select_parts[] = "CAST({$quoted_column} AS BINARY) AS {$quoted_column}";
                }
            }
            $set_label_check = $this->get_set_label_check_expression(array_keys($this->current_column_types));
            if ($set_label_check !== null) {
                $select_parts[] = $set_label_check;
            }
            if ($this->multisite_selection !== null) {
                $reference_check = $this->multisite_selection->get_user_reference_check($this->current_table);
                if ($reference_check !== null) {
                    if (isset($this->current_column_types['__reprint_user_reference_valid'])) {
                        throw new \RuntimeException('The source table contains the reserved column __reprint_user_reference_valid.');
                    }
                    $select_parts[] = $reference_check . ' AS __reprint_user_reference_valid';
                }
            }
            $query = $select . " " . implode(", ", $select_parts) .
                " FROM " . $this->quote_identifier($this->current_table);
        } else {
            $query = $select . " * FROM " . $this->quote_identifier($this->current_table);
        }

        return $query;
    }

    /**
     * Checks SET labels in the existing row query, without another table scan.
     *
     * MySQL and MariaDB can store SET('🙂','ok') but expose SET('?','ok') in
     * SHOW CREATE TABLE: definitions use the server's metadata character set,
     * not character_set_results. Copying mask 1 would then silently store '?'.
     * Round-trip each selected label through that encoding and return only the
     * first affected column name. NULL and literal '?' labels remain valid.
     * This checks selected rows, not unused members of the table definition.
     *
     * @param string[] $result_columns Selected column names; also used to avoid alias collisions.
     * @return string|null Hidden check expression, or null without numeric SET columns.
     */
    private function get_set_label_check_expression(array $result_columns): ?string
    {
        $this->invalid_set_column_alias = null;
        if (!$this->is_numeric_type("SET")) {
            return null;
        }
        $checks = [];
        foreach ($result_columns as $column) {
            if (!isset($this->current_column_types[$column]) || strtoupper($this->get_data_type($column)) !== "SET") {
                continue;
            }
            if ($this->metadata_character_set === null) {
                $this->metadata_character_set = $this->db->query("SELECT @@character_set_system")->fetchColumn();
            }
            $identifier = $this->quote_identifier($column);
            $metadata_character_set = $this->quote_identifier($this->metadata_character_set);
            $label = "CONVERT({$identifier} USING utf8mb4)";
            $round_tripped_label = "CONVERT(CONVERT({$identifier} USING {$metadata_character_set}) USING utf8mb4)";
            $checks[] = "WHEN BINARY {$label} <> BINARY {$round_tripped_label} THEN X'" . bin2hex($column) . "'";
        }
        if ($checks === []) {
            return null;
        }
        $alias = "__reprint_invalid_set_column";
        $lowercase_columns = array_map("strtolower", $result_columns);
        while (in_array(strtolower($alias), $lowercase_columns, true)) {
            $alias = "_" . $alias;
        }
        $this->invalid_set_column_alias = $alias;
        return "CASE " . implode(" ", $checks) . " END AS " . $this->quote_identifier($alias);
    }

    /** Returns an internal SELECT alias which cannot collide with a real column. */
    private function get_spatial_length_alias($column)
    {
        if (isset($this->spatial_length_aliases[$column])) {
            return $this->spatial_length_aliases[$column];
        }
        $index = count($this->spatial_length_aliases);
        $lowercase_column_names = array_map(
            "strtolower",
            array_keys($this->current_column_types)
        );
        do {
            $alias = "__reprint_internal_spatial_length_{$index}";
            ++$index;
        } while (in_array(strtolower($alias), $lowercase_column_names, true));
        $this->spatial_length_aliases[$column] = $alias;
        return $alias;
    }

    /** Returns an internal SRID-prefix alias which cannot collide with real columns. */
    private function get_spatial_prefix_alias($column)
    {
        if (isset($this->spatial_prefix_aliases[$column])) {
            return $this->spatial_prefix_aliases[$column];
        }
        $index = count($this->spatial_prefix_aliases);
        $lowercase_column_names = array_map(
            "strtolower",
            array_keys($this->current_column_types)
        );
        do {
            $prefix_alias = "__reprint_internal_spatial_prefix_{$index}";
            ++$index;
        } while (in_array(strtolower($prefix_alias), $lowercase_column_names, true));
        $this->spatial_prefix_aliases[$column] = $prefix_alias;
        return $prefix_alias;
    }

    /** Removes internal spatial metadata fields from one fetched row. */
    private function extract_spatial_value_metadata($record)
    {
        $this->current_spatial_value_lengths = [];
        $this->current_oversized_spatial_value_prefixes = [];
        foreach ($this->spatial_length_aliases as $column => $alias) {
            if (!array_key_exists($alias, $record)) {
                throw new \RuntimeException(
                    "Spatial length field '{$alias}' is missing from the database row."
                );
            }
            $this->current_spatial_value_lengths[$column] = $record[$alias] === null
                ? null
                : (int) $record[$alias];
            unset($record[$alias]);
        }
        foreach ($this->spatial_prefix_aliases as $column => $alias) {
            if (!array_key_exists($alias, $record)) {
                throw new \RuntimeException(
                    "A spatial SRID-prefix field is missing from the database row."
                );
            }
            $this->current_oversized_spatial_value_prefixes[$column] = $record[$alias];
            unset($record[$alias]);
        }
        return $record;
    }

    /**
     * Applies the same source-side filters to batches, row reloads, and value chunks.
     *
     * Full rows carry a separate reference-check column so a changed relationship
     * raises an error instead of silently skipping a still-referenced user.
     * Substring reads cannot carry that column; a failed WHERE check produces
     * the existing missing-oversized-row error instead.
     *
     * @param bool $check_saved_reference Whether this is an oversized substring read.
     * @return string[] SQL conditions, each grouped for safe AND composition.
     */
    public function get_current_row_selection_conditions(bool $check_saved_reference = false): array
    {
        $conditions = [];
        if ($this->multisite_selection !== null && $this->current_table !== null) {
            $conditions[] = '(' . $this->multisite_selection->get_row_condition($this->current_table) . ')';
            if ($check_saved_reference) {
                $reference_check = $this->multisite_selection->get_user_reference_check($this->current_table);
                if ($reference_check !== null) {
                    $conditions[] = '(' . $reference_check . ')';
                }
            }
        }
        if (!$this->current_table || empty($this->exclude_rows_by_table[$this->current_table])) {
            return $conditions;
        }
        foreach ($this->exclude_rows_by_table[$this->current_table] as $rule) {
            $column = $rule["column"];
            if (!isset($this->current_column_types[$column])) {
                continue;
            }
            $quoted_column = $this->quote_identifier($column);
            $literal = $this->format_source_binary_literal($rule["value"]);
            // NULL <> value is UNKNOWN, so preserve NULL explicitly.
            $conditions[] = "({$quoted_column} IS NULL OR {$quoted_column} <> {$literal})";
        }
        return $conditions;
    }

    /**
     * Applies the configured query limit to rows, discovery, and value chunks.
     * Prevent one slow query from consuming the PHP time budget.
     */
    public function get_select_prefix(): string
    {
        return 'SELECT' . ( $this->query_time_limit_ms === null
            ? '' : " /*+ MAX_EXECUTION_TIME({$this->query_time_limit_ms}) */" );
    }

    /**
     * Builds the lexicographic condition after a composite primary key.
     *
     * For (a, b, c), this expands to:
     * (a > A) OR (a = A AND b > B) OR (a = A AND b = B AND c > C).
     * The expanded form works on MySQL versions which do not optimize row-value
     * comparisons well.
     */
    private function build_pk_where_clause()
    {
        if (!$this->last_pk_values || count($this->current_pk_columns) === 0) {
            return "1=1";
        }
        if (count($this->current_pk_columns) === 1) {
            $column = $this->current_pk_columns[0];
            return $this->build_comparison($column, $this->last_pk_values[$column], ">");
        }
        $conditions = [];
        $prefix_conditions = [];
        foreach ($this->current_pk_columns as $column) {
            $value = $this->last_pk_values[$column];
            $parts = $prefix_conditions;
            $parts[] = $this->build_comparison($column, $value, ">");
            $conditions[] = "(" . implode(" AND ", $parts) . ")";
            $prefix_conditions[] = $this->build_comparison($column, $value, "=");
        }
        return "(" . implode(" OR ", $conditions) . ")";
    }

    /**
     * Builds a typed primary-key comparison for a source read or destination SQL.
     *
     * @param string $column Column name.
     * @param mixed  $value Raw key value.
     * @param string $operator Comparison operator.
     * @param bool   $source_query Whether to use the source server's supported encoding.
     * @return string
     */
    public function build_comparison($column, $value, $operator, bool $source_query = true)
    {
        $column_expression = $this->build_primary_key_column_expression($column);
        if ($value === null) {
            return $operator === "="
                ? "{$column_expression} IS NULL"
                : "{$column_expression} IS NOT NULL";
        }
        if ($this->is_numeric_type($this->get_data_type($column))) {
            if (!is_numeric($value)) {
                throw new \InvalidArgumentException("Cannot compare numeric primary key '{$column}': the cursor contains a non-numeric value, " . json_encode($value) . '.');
            }
            return "{$column_expression} {$operator} {$value}";
        }
        $literal = $source_query
            ? $this->format_source_binary_literal($value)
            : "FROM_BASE64('" . base64_encode($value) . "')";
        return "{$column_expression} {$operator} {$literal}";
    }

    /**
     * Quotes raw source bytes without relying on the connection character set.
     * Destination SQL keeps its separate base64 format, including on old sources.
     */
    private function format_source_binary_literal(string $value): string
    {
        if ($this->supports_from_base64 === null) {
            $version = $this->db->query('SELECT VERSION()')->fetchColumn();
            // MariaDB may report a 5.5.5 compatibility prefix even on modern servers.
            $this->supports_from_base64 = stripos($version, 'MariaDB') !== false
                || version_compare($version, '5.6.1', '>=');
        }
        if ($this->supports_from_base64) {
            return "FROM_BASE64('" . base64_encode($value) . "')";
        }
        return "UNHEX('" . bin2hex($value) . "')";
    }

    /**
     * Builds the column expression shared by primary-key comparison and order.
     *
     * Character columns retain their declared collation and remain bare so the
     * database can use a primary-key range scan. FROM_BASE64() and UNHEX() have higher
     * coercibility than the column, so MySQL applies the column's character set
     * and collation without reading cursor bytes through the connection
     * character set. ENUM uses a binary cast because its index position and
     * fetched label differ. MySQL SET compares and sorts the exported mask.
     */
    private function build_primary_key_column_expression($column)
    {
        $qualified_column = $this->quote_identifier($this->current_table) . "." .
            $this->quote_identifier($column);
        $data_type = strtoupper($this->get_data_type($column));
        if ($data_type === "SET" && $this->is_numeric_type($data_type)) {
            return "CAST({$qualified_column} AS UNSIGNED)";
        }
        if ($this->is_numeric_type($data_type) || $this->is_binary_type($data_type)) {
            return $qualified_column;
        }
        if ($this->is_character_string_type($data_type)) {
            return $qualified_column;
        }
        return "CAST({$qualified_column} AS BINARY)";
    }

    /** Returns primary key column names in ordinal order, or an empty array. */
    private function get_primary_key_columns($table)
    {
        $primary_key_columns = [];
        $columns_by_position = [];
        $has_usable_positions = true;
        $query = "SHOW INDEX FROM " . $this->quote_identifier($table);
        try {
            $statement = $this->db->query($query);
        } catch (\Exception $e) {
            throw new \RuntimeException(
                "Failed to get primary key columns for " . $this->quote_identifier($table) . ": " . $e->getMessage() . " Query: {$query}"
            );
        }
        $row = $statement->fetch(PdoConstants::fetch_assoc());
        while ($row !== false) {
            if (!isset($row["Key_name"]) || strcasecmp($row["Key_name"], "PRIMARY") !== 0) {
                $row = $statement->fetch(PdoConstants::fetch_assoc());
                continue;
            }

            $column = $row["Column_name"];
            $primary_key_columns[] = $column;
            $position = $row["Seq_in_index"] ?? null;
            if (is_string($position) && ctype_digit($position)) {
                $position = intval($position);
            }
            if (
                !is_int($position) ||
                $position < 1 ||
                isset($columns_by_position[$position])
            ) {
                $has_usable_positions = false;
            } else {
                $columns_by_position[$position] = $column;
            }
            $row = $statement->fetch(PdoConstants::fetch_assoc());
        }

        if (!$has_usable_positions) {
            return $primary_key_columns;
        }
        ksort($columns_by_position, SORT_NUMERIC);
        return array_values($columns_by_position);
    }

    /**
     * Selects the next table in the current group and resets its row cursor.
     * Returns false if the table list is not initialized or this group is complete.
     */
    public function move_to_next_table()
    {
        if ($this->tables_to_process === null) {
            return false;
        }
        if ($this->current_table !== null && array_key_exists($this->current_table, $this->tables_to_process)) {
            ++$this->tables_before_current;
        }
        $tables = $this->get_tables_in_current_group();
        $position = $this->current_table === null ? -1 : array_search($this->current_table, $tables, true);
        $this->current_table = $position !== false && isset($tables[$position + 1]) ? $tables[$position + 1] : null;
        if ($this->current_table) {
            $this->current_pk_columns = $this->get_primary_key_columns($this->current_table);
            $this->last_pk_values = null;
            $this->current_query_last_candidate_id = null;
            $this->current_offset = 0;
            $this->current_table_rows_processed = 0;
            $this->current_column_types = $this->get_column_types($this->current_table);
            $this->current_column_names = array_keys($this->current_column_types);
            $this->current_row = null;
            $this->current_row_ends_query_batch = false;
            $this->current_spatial_value_lengths = [];
            $this->current_oversized_spatial_value_prefixes = [];
            $this->spatial_length_aliases = [];
            $this->spatial_prefix_aliases = [];
        }
        return (bool) $this->current_table;
    }

    /**
     * Discovers tables and row estimates together, excluding views and Reprint progress tables.
     *
     * @TODO: Paginate databases with millions of tables.
     */
    public function initialize_tables_to_process()
    {
        $this->tables_to_process = [];
        $statement = $this->db->query("SHOW TABLE STATUS;");
        $row = $statement->fetch(PdoConstants::fetch_assoc());
        while ($row !== false) {
            $name = $row["Name"];
            $excluded = stripos(
                $name,
                self::MYSQL_IMPORT_PROGRESS_TABLE_PREFIX
            ) === 0;
            foreach ($this->exclude_tables as $excluded_table) {
                if (strcasecmp($name, $excluded_table) === 0) {
                    $excluded = true;
                    break;
                }
            }
            if (
                isset($row["Engine"])
                && !$excluded
                && !MultisiteDatabaseSelection::is_internal_table($name)
                && ( $this->multisite_selection === null || $this->multisite_selection->includes_table($name) )
            ) {
                $this->tables_to_process[$name] = isset($row["Rows"]) && is_numeric($row["Rows"])
                    ? (int) $row["Rows"]
                    : null;
            }
            $row = $statement->fetch(PdoConstants::fetch_assoc());
        }
    }

    /**
     * Computes the ordered table names when moving between tables or resuming.
     * The current group and table name determine the position; there is no
     * stored group list or separate table-list index to restore.
     *
     * For a selected-site users-only export, the content list still includes
     * posts, comments and links. The reader visits those tables for user IDs,
     * without SQL output. Building this list does not read those tables.
     *
     * @return string[] Tables in the current group.
     */
    private function get_tables_in_current_group(): array
    {
        if ($this->multisite_selection === null) {
            return $this->get_selected_table_names();
        }
        if ($this->table_group === 'content') {
            return $this->multisite_selection->get_content_tables($this->get_selected_table_names());
        }
        return $this->multisite_selection->get_user_tables($this->get_selected_table_names());
    }

    /** Keeps numeric table names as strings after PHP converts their array keys to integers. */
    private function get_selected_table_names(): array
    {
        return array_map('strval', array_keys($this->tables_to_process));
    }

    /** Returns cached column metadata for a table. */
    private function get_column_types($table_name)
    {
        if (isset($this->column_type_cache[$table_name])) {
            return $this->column_type_cache[$table_name];
        }
        try {
            $statement = $this->db->query(
                "SHOW FULL COLUMNS FROM " . $this->quote_identifier($table_name)
            );
        } catch (\Exception $e) {
            throw new \RuntimeException(
                "Failed to get column types for " . $this->quote_identifier($table_name) . ": " . $e->getMessage()
            );
        }
        $columns = [];
        $row = $statement->fetch(PdoConstants::fetch_assoc());
        while ($row !== false) {
            $column_type = $row["Type"];
            $columns[$row["Field"]] = [
                "data_type" => preg_replace('/[\s(].*$/', '', $column_type),
                "column_type" => $column_type,
                "collation" => $row["Collation"] ?? null,
                "nullable" => isset($row["Null"]) && strtoupper($row["Null"]) === "YES",
                "comment" => (string) ( $row["Comment"] ?? "" ),
            ];
            $row = $statement->fetch(PdoConstants::fetch_assoc());
        }
        $this->column_type_cache[$table_name] = $columns;
        return $columns;
    }

    /**
     * Returns the SELECT expression used by pull and push to read numeric values.
     *
     * MySQL SET('','a') displays both mask 0 and mask 1 as ''. Reading the
     * unsigned mask when requested keeps them distinct, including when the
     * column is a primary key. SQLite has only the label, so its SET columns
     * remain text.
     *
     * FLOAT needs promotion on the database side, before the driver's text
     * protocol can round it. Adding 0e0 requests a DOUBLE result without adding
     * precision to the stored value. preserve_floating_point_values() then
     * prevents a second loss of digits when PHP converts a native float.
     *
     * Other types return their quoted identifier unchanged. Callers may pass
     * every column; this method does not turn text or spatial values into numbers.
     */
    public function get_numeric_value_expression(string $column): string
    {
        $identifier = $this->quote_identifier($column);
        $data_type = strtoupper($this->get_data_type($column));
        if ($data_type === "BIT" || ( $data_type === "SET" && $this->is_numeric_type($data_type) )) {
            // Packed BIT bytes vary by driver. SET labels cannot distinguish
            // mask 0 from an empty-string member. Never cast either to PHP int:
            // both types can use the full unsigned 64-bit range.
            return "CAST({$identifier} AS UNSIGNED)";
        }
        if (in_array($data_type, ["FLOAT", "DOUBLE", "REAL"], true)) {
            // Promote FLOAT before transport: the text protocol can otherwise
            // return only six significant digits of its stored binary value.
            return "({$identifier} + 0e0)";
        }
        return $identifier;
    }

    /** Identifies numeric types which the dump emits as bare literals. */
    public function is_numeric_type($data_type)
    {
        $data_type = strtoupper($data_type);
        if ($data_type === "SET") {
            // Both SQLite adapters store labels, without a MySQL SET bitmask.
            return $this->set_value_format === "unsigned" && !$this->db instanceof SqliteDriverPDO && !$this->db instanceof \WP_PDO_MySQL_On_SQLite;
        }
        foreach (["TINYINT", "SMALLINT", "MEDIUMINT", "INTEGER", "INT", "BIGINT", "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "REAL", "BIT", "YEAR"] as $type) {
            if (strpos($data_type, $type) === 0) {
                return true;
            }
        }
        return false;
    }

    /** Identifies binary columns which do not need a binary SELECT cast. */
    public function is_binary_type($data_type)
    {
        $data_type = strtoupper($data_type);
        foreach (["BINARY", "VARBINARY", "TINYBLOB", "BLOB", "MEDIUMBLOB", "LONGBLOB"] as $type) {
            if (strpos($data_type, $type) === 0) {
                return true;
            }
        }
        return false;
    }

    /** Identifies character strings whose SQL substring ranges count characters. */
    public function is_character_string_type($data_type)
    {
        $data_type = strtoupper($data_type);
        foreach (["CHAR", "VARCHAR", "TINYTEXT", "TEXT", "MEDIUMTEXT", "LONGTEXT"] as $type) {
            if (strpos($data_type, $type) === 0) {
                return true;
            }
        }
        return false;
    }

    /** Identifies MySQL and MariaDB spatial column types. */
    public function is_spatial_type($data_type)
    {
        return in_array(
            strtoupper($data_type),
            [
                "GEOMETRY",
                "POINT",
                "LINESTRING",
                "POLYGON",
                "MULTIPOINT",
                "MULTILINESTRING",
                "MULTIPOLYGON",
                "GEOMCOLLECTION",
                "GEOMETRYCOLLECTION",
            ],
            true
        );
    }

    /** Returns the DATA_TYPE string for a column, or throws if unknown. */
    public function get_data_type(string $column): string
    {
        return $this->get_column_metadata($column)["data_type"];
    }

    /**
     * Returns the cached SHOW FULL COLUMNS fields needed by the producer.
     *
     * @return array {
     *     Column metadata.
     *
     *     @type string      $data_type   Base data type.
     *     @type string      $column_type Complete declared data type.
     *     @type string|null $collation   Collation name, or null for non-character columns.
     *     @type bool        $nullable    Whether the column accepts NULL.
     *     @type string      $comment     Column comment.
     * }
     */
    public function get_column_metadata(string $column): array
    {
        if (!isset($this->current_column_types[$column])) {
            throw new \RuntimeException(
                "No column type info for '{$column}' in table " .
                $this->quote_identifier($this->current_table) .
                ". This is a bug — SHOW FULL COLUMNS should have returned it."
            );
        }
        return $this->current_column_types[$column];
    }

    /** Returns the declared character set's maximum bytes per character. */
    public function get_maximum_character_bytes(string $column): int
    {
        if (!isset($this->current_column_types[$column])) {
            throw new \RuntimeException(
                "No column type info for '{$column}' in table " .
                $this->quote_identifier($this->current_table) . "."
            );
        }

        $collation = $this->current_column_types[$column]["collation"];
        if ($collation === null) {
            return 1;
        }
        if (isset($this->maximum_character_bytes_by_collation[$collation])) {
            return $this->maximum_character_bytes_by_collation[$collation];
        }

        $statement = $this->db->prepare(
            "SELECT character_sets.MAXLEN " .
            "FROM information_schema.COLLATIONS AS collations " .
            "JOIN information_schema.CHARACTER_SETS AS character_sets " .
            "ON character_sets.CHARACTER_SET_NAME = collations.CHARACTER_SET_NAME " .
            "WHERE collations.COLLATION_NAME = ?"
        );
        $statement->execute([$collation]);
        $maximum_character_bytes = (int) $statement->fetchColumn();
        if ($maximum_character_bytes < 1) {
            // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Database metadata errors are never HTML.
            throw new \RuntimeException(
                "Cannot determine the maximum character byte length for column " .
                $this->quote_identifier($this->current_table) . "." .
                $this->quote_identifier($column) . " with collation {$collation}."
            );
            // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        }

        $this->maximum_character_bytes_by_collation[$collation] = $maximum_character_bytes;
        return $maximum_character_bytes;
    }

    /** Escapes backticks by doubling them: tricky`table becomes `tricky``table`. */
    public function quote_identifier($identifier)
    {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }

    /**
     * Encodes database strings for JSON cursor storage.
     *
     * JSON cannot represent arbitrary database bytes. The __binary__ marker
     * distinguishes strings which must be decoded when restoring the cursor.
     */
    public function encode_database_values_for_cursor($values)
    {
        if ($values === null) {
            return null;
        }
        $encoded = [];
        foreach ($values as $column => $value) {
            $encoded[$column] = $value !== null && is_string($value)
                ? ["__binary__" => base64_encode($value)]
                : $value;
        }
        return $encoded;
    }

    /** Restores database strings encoded by encode_database_values_for_cursor(). */
    public function decode_database_values_from_cursor($values)
    {
        if ($values === null) {
            return null;
        }
        $decoded = [];
        foreach ($values as $column => $value) {
            $decoded[$column] = is_array($value) && isset($value["__binary__"])
                ? base64_decode($value["__binary__"])
                : $value;
        }
        return $decoded;
    }
}
