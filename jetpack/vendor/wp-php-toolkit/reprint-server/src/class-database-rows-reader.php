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

    /** @var array|null */
    private $current_pk_columns = null;

    /**
     * Cursor bookmark containing the primary key of the last returned record.
     * The next SELECT starts strictly after these values.
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

    /** @var array */
    private $tables_to_process;

    /**
     * Column metadata cached by table and column name. Each column contains
     * data_type (for example, varchar), column_type (for example,
     * varchar(255)), and its nullable collation name.
     *
     * @var array<string,array<string,array{data_type:string,column_type:string,collation:?string}>>
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

    /** @var int|null */
    private $query_time_limit_ms = null;

    /** @var array<string,list<array{column:string,value:string}>> Row exclusions keyed by table. */
    private $exclude_rows_by_table = [];

    /** @var string[] Table names omitted from automatic discovery. */
    private $exclude_tables = [];


    /**
     * Initializes the bounded database row reader.
     *
     * @param mixed $db PDO or a PDO-compatible adapter.
     * @param array $options {
     *     Reader options.
     *
     *     @type array|null $tables_to_process   Tables to read, or null to discover them.
     *     @type int        $batch_size          Maximum records per query.
     *     @type int|null   $query_time_limit_ms Maximum query duration in milliseconds.
     *     @type array      $exclude_rows        Table, column, and value exclusion rules.
     *     @type string[]   $exclude_tables      Table names to omit from automatic discovery.
     * }
     */
    public function __construct($db, $options = [])
    {
        $this->db = $db;
        $this->tables_to_process = $options["tables_to_process"] ?? null;
        $this->batch_size = max(1, (int) ( $options["batch_size"] ?? 250 ));
        $this->exclude_tables = array_values(array_filter(
            $options["exclude_tables"] ?? [],
            "is_string"
        ));

        if (isset($options["query_time_limit_ms"])) {
            $limit = (int) $options["query_time_limit_ms"];
            $this->query_time_limit_ms = $limit > 0 ? $limit : null;
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
    }

    /**
     * Fetches the next row and advances the resume position.
     *
     * An exhausted batch opens another bounded query after the last primary
     * key. A fresh query returning no rows means the table is complete.
     */
    public function next_record()
    {
        $this->current_row_ends_query_batch = false;
        if (!$this->current_result_set) {
            $query = $this->build_select_query();
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
            if ($this->rows_fetched_from_current_query === 0) {
                return false;
            }
            if ($this->last_pk_values !== null || $this->current_offset > 0) {
                return $this->next_record();
            }
            return false;
        }

        ++$this->rows_fetched_from_current_query;
        if ($this->current_column_names === null) {
            $this->current_column_names = array_keys($record);
        }

        if ($this->current_pk_columns && count($this->current_pk_columns) > 0) {
            $this->last_pk_values = [];
            foreach ($this->current_pk_columns as $column) {
                if (!array_key_exists($column, $record)) {
                    throw new \RuntimeException(
                        "Primary key column '{$column}' missing from SELECT result for table " .
                        $this->quote_identifier($this->current_table)
                    );
                }
                $this->last_pk_values[$column] = $record[$column];
            }
        } else {
            ++$this->current_offset;
        }

        $this->current_row = $record;
        if ($this->rows_fetched_from_current_query >= $this->batch_size) {
            $this->current_row_ends_query_batch = true;
            $this->release_current_result_set();
        }
        return true;
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
     *     @type array|null  $current_row         Encoded retained record.
     *     @type bool        $current_row_ends_query_batch Whether the retained record ends its query batch.
     *     @type array|null  $current_column_names Current column names.
     * }
     */
    public function get_cursor_state()
    {
        return [
            "current_table" => $this->current_table,
            "current_pk_columns" => $this->current_pk_columns,
            "last_pk_values" => $this->encode_database_values_for_cursor($this->last_pk_values),
            "current_offset" => $this->current_offset,
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
        if ($this->current_table) {
            $position = array_search($this->current_table, $this->tables_to_process, true);
            if ($position === false) {
                $this->current_table = null;
                return false;
            }
            reset($this->tables_to_process);
            while (key($this->tables_to_process) !== $position) {
                next($this->tables_to_process);
            }
            if ($this->get_primary_key_columns($this->current_table) !== $this->current_pk_columns) {
                throw new \RuntimeException(
                    "Cannot restore the database row cursor because the primary key for table " .
                    $this->quote_identifier($this->current_table) . " changed."
                );
            }
            $this->current_column_types = $this->get_column_types($this->current_table);
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
    private function build_select_query()
    {
        $select = "SELECT";
        if ($this->query_time_limit_ms !== null) {
            // Prevent one slow table query from consuming the PHP time budget.
            $select .= " /*+ MAX_EXECUTION_TIME(" . $this->query_time_limit_ms . ") */";
        }

        if ($this->current_column_types) {
            $select_parts = [];
            foreach ($this->current_column_types as $column => $column_info) {
                $quoted_column = $this->quote_identifier($column);
                if (
                    $this->is_numeric_type($column_info["data_type"]) ||
                    $this->is_binary_type($column_info["data_type"])
                ) {
                    $select_parts[] = $quoted_column;
                } else {
                    $select_parts[] = "CAST({$quoted_column} AS BINARY) AS {$quoted_column}";
                }
            }
            $query = $select . " " . implode(", ", $select_parts) .
                " FROM " . $this->quote_identifier($this->current_table);
        } else {
            $query = $select . " * FROM " . $this->quote_identifier($this->current_table);
        }

        $where_conditions = $this->build_row_exclusion_where_conditions();
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

    private function build_row_exclusion_where_conditions()
    {
        if (!$this->current_table || empty($this->exclude_rows_by_table[$this->current_table])) {
            return [];
        }
        $conditions = [];
        foreach ($this->exclude_rows_by_table[$this->current_table] as $rule) {
            $column = $rule["column"];
            if (!isset($this->current_column_types[$column])) {
                continue;
            }
            $quoted_column = $this->quote_identifier($column);
            $encoded_value = base64_encode($rule["value"]);
            // NULL <> value is UNKNOWN, so preserve NULL explicitly.
            $conditions[] = "{$quoted_column} IS NULL OR {$quoted_column} <> FROM_BASE64('{$encoded_value}')";
        }
        return $conditions;
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

    public function build_comparison($column, $value, $operator)
    {
        $column_expression = $this->build_primary_key_column_expression($column);
        if ($value === null) {
            return $operator === "="
                ? "{$column_expression} IS NULL"
                : "{$column_expression} IS NOT NULL";
        }
        if ($this->is_numeric_type($this->get_data_type($column))) {
            return "{$column_expression} {$operator} {$value}";
        }
        return "{$column_expression} {$operator} FROM_BASE64('" . base64_encode($value) . "')";
    }

    /**
     * Builds the column expression shared by primary-key comparison and order.
     *
     * Character columns retain their declared collation and remain bare so the
     * database can use a primary-key range scan. FROM_BASE64() has higher
     * coercibility than the column, so MySQL applies the column's character set
     * and collation without reading cursor bytes through the connection
     * character set. ENUM and SET use a binary cast because their index
     * positions and fetched string values differ.
     */
    private function build_primary_key_column_expression($column)
    {
        $qualified_column = $this->quote_identifier($this->current_table) . "." .
            $this->quote_identifier($column);
        $data_type = strtoupper($this->get_data_type($column));
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

    public function move_to_next_table()
    {
        if ($this->tables_to_process === null) {
            return false;
        }
        if (!$this->current_table) {
            $this->current_table = reset($this->tables_to_process) ?: null;
        } else {
            $this->current_table = next($this->tables_to_process) ?: null;
        }
        if ($this->current_table) {
            $this->current_pk_columns = $this->get_primary_key_columns($this->current_table);
            $this->last_pk_values = null;
            $this->current_offset = 0;
            $this->current_column_types = $this->get_column_types($this->current_table);
            $this->current_column_names = array_keys($this->current_column_types);
            $this->current_row = null;
            $this->current_row_ends_query_batch = false;
        }
        return (bool) $this->current_table;
    }

    /**
     * Discovers BASE TABLEs and excludes views and Reprint progress tables.
     *
     * @TODO: Paginate databases with millions of tables.
     */
    public function initialize_tables_to_process()
    {
        $this->tables_to_process = [];
        $statement = $this->db->query("SHOW FULL TABLES");
        $row = $statement->fetch(PdoConstants::fetch_assoc());
        while ($row !== false) {
            $values = array_values($row);
            $excluded = isset($values[0]) && stripos(
                $values[0],
                self::MYSQL_IMPORT_PROGRESS_TABLE_PREFIX
            ) === 0;
            foreach ($this->exclude_tables as $excluded_table) {
                if (isset($values[0]) && strcasecmp($values[0], $excluded_table) === 0) {
                    $excluded = true;
                    break;
                }
            }
            if (
                isset($values[0], $values[1])
                && strcasecmp($values[1], "BASE TABLE") === 0
                && !$excluded
            ) {
                $this->tables_to_process[] = $values[0];
            }
            $row = $statement->fetch(PdoConstants::fetch_assoc());
        }
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
            ];
            $row = $statement->fetch(PdoConstants::fetch_assoc());
        }
        $this->column_type_cache[$table_name] = $columns;
        return $columns;
    }

    /** Identifies numeric types which the dump emits as bare literals. */
    public function is_numeric_type($data_type)
    {
        $data_type = strtoupper($data_type);
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

    /** Returns the DATA_TYPE string for a column, or throws if unknown. */
    public function get_data_type(string $column): string
    {
        if (!isset($this->current_column_types[$column]["data_type"])) {
            throw new \RuntimeException(
                "No column type info for '{$column}' in table " .
                $this->quote_identifier($this->current_table) .
                ". This is a bug — SHOW FULL COLUMNS should have returned it."
            );
        }
        return $this->current_column_types[$column]["data_type"];
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
