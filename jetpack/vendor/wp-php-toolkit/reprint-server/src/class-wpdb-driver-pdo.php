<?php
/**
 * wpdb-backed PDO adapter for MySQL exports on PDO-less hosts.
 *
 * MySQLDumpProducer expects a PDO connection — prepare(), query(), and the
 * statement methods fetch(), fetchAll(), fetchColumn(), execute().
 * On hosts without ext-pdo / ext-pdo_mysql, this adapter wraps WordPress's
 * global $wpdb so the dump producer can run unchanged.
 *
 * Surface area mirrors SqliteDriverPDO 1:1 — only the methods MySQLDumpProducer
 * and the export endpoints actually call. Behavior parity with real PDO is the
 * bar; behavioral divergence (wpdb's HTML error rendering, sticky last_error,
 * get_results null ambiguity) is normalized inside the adapter.
 *
 * Charset: create_db_connection() gives PDO and wpdb the same utf8mb4_bin
 * session context. The dump producer casts non-numeric result columns to
 * binary, while text primary key comparisons retain their stored collation.
 */

namespace WordPress\Reprint\Server;

/**
 * Wraps a WordPress wpdb instance to look like a PDO connection.
 */
class WpdbDriverPDO
{
    /** @var object */
    private $wpdb;

    /**
     * @param object $wpdb The global WordPress $wpdb. Type hint omitted because
     *        wpdb subclasses (HyperDB, LudicrousDB, SQLite drop-in) are not
     *        guaranteed to extend the canonical class in all environments,
     *        and the test double is not a wpdb subclass.
     */
    public function __construct($wpdb)
    {
        $this->wpdb = $wpdb;

        // Prevent wpdb from echoing HTML error blocks into the response stream.
        // The export endpoints emit gzip multipart, so even one HTML chunk
        // would corrupt the output stream irrecoverably. No restore on
        // shutdown: export endpoints terminate the request after streaming.
        $wpdb->suppress_errors(true);
        $wpdb->hide_errors();
    }

    public function prepare(string $sql): WpdbDriverPDOStatement
    {
        return new WpdbDriverPDOStatement($this->wpdb, $sql);
    }

    public function query(string $sql): WpdbDriverPDOStatement
    {
        $stmt = new WpdbDriverPDOStatement($this->wpdb, $sql);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Quotes a string for safe inclusion in a query.
     *
     * Calls $wpdb->_real_escape() — a public method on wpdb (and its
     * subclasses); the leading underscore is naming convention only, not
     * visibility. Calling it directly keeps the adapter free of any global
     * function dependency and HyperDB / LudicrousDB / SQLite-drop-in safe.
     */
    public function quote(string $value, $type = null): string
    {
        return "'" . $this->wpdb->_real_escape($value) . "'";
    }
}

/**
 * PDOStatement-shaped wrapper around a wpdb query result set.
 *
 * Substitutes positional (?) and named (:name) placeholders manually rather
 * than calling $wpdb->prepare() — wpdb's prepare uses %s/%d and adds quoting
 * itself, which would conflict with how MySQLDumpProducer builds queries.
 */
class WpdbDriverPDOStatement
{
    /** @var object */
    private $wpdb;

    /** @var string */
    private $sql;

    /** @var array Stored result rows after execution. */
    private $rows = [];

    /** @var int Current position for fetch(). */
    private $position = 0;

    /** @var array Parameters bound via bindValue(). */
    private $bound_params = [];

    /**
     * @param object $wpdb
     * @param string $sql
     */
    public function __construct($wpdb, string $sql)
    {
        $this->wpdb = $wpdb;
        $this->sql = $sql;
    }

    /**
     * Executes the prepared statement.
     *
     * Substitutes parameters into $this->sql, clears any sticky
     * $wpdb->last_error (which can survive from queries that ran before the
     * exporter took over the request), runs $wpdb->get_results($sql,
     * ARRAY_A), and disambiguates the null return: null + non-empty
     * last_error -> RuntimeException; null + empty last_error -> empty result
     * set.
     *
     * @param array|null $params Positional or named parameters.
     */
    public function execute($params = null): bool
    {
        $sql = $this->substitute_placeholders($this->sql, $params ?? $this->bound_params);

        // Clear sticky last_error so the post-dispatch check below can't
        // throw a phantom query error from a prior query.
        $this->clear_last_error();

        $rows = $this->wpdb->get_results($sql, 'ARRAY_A');
        $this->discard_query_log();
        $last_error = $this->get_last_error();

        if ($last_error !== '') {
            throw new \RuntimeException($last_error);
        }

        $this->rows = is_array($rows) ? $rows : [];
        $this->position = 0;
        return true;
    }

    /**
     * $mode is accepted for PDO compatibility but only FETCH_ASSOC is honored.
     * MySQLDumpProducer never asks for any other mode.
     */
    public function fetch($mode = null)
    {
        if ($this->position >= count($this->rows)) {
            return false;
        }
        return $this->rows[$this->position++];
    }

    /**
     * Honors FETCH_ASSOC (default) and FETCH_COLUMN. Other PDO modes are
     * unsupported — MySQLDumpProducer never asks for any other mode.
     */
    public function fetchAll($mode = null): array
    {
        $mode = $mode ?? PdoConstants::fetch_assoc();
        $remaining = array_slice($this->rows, $this->position);
        $this->position = count($this->rows);

        if ($mode === PdoConstants::fetch_column()) {
            return array_map(static function ($row) {
                return reset($row);
            }, $remaining);
        }

        return $remaining;
    }

    public function fetchColumn(int $column_number = 0)
    {
        $row = $this->fetch();
        if ($row === false) {
            return false;
        }
        $values = array_values($row);
        return $values[$column_number] ?? false;
    }

    public function bindValue($parameter, $value, $type = null): bool
    {
        $this->bound_params[$parameter] = $value;
        return true;
    }

    /**
     * Substitutes ? and :name placeholders with quoted parameter values.
     *
     * Walks $sql byte-by-byte tracking single/double-quoted string literals so
     * a literal '?' or ':name' inside a string is not treated as a placeholder.
     * Inside a literal, a backslash escapes the next byte (MySQL extension)
     * so `\'` does not close the string. Positional substitution runs right
     * to left so earlier offsets stay valid. Named substitution uses a regex
     * with a word-boundary tail (/:name(?![A-Za-z0-9_])/) so :foo does not
     * corrupt :foobar.
     */
    private function clear_last_error(): void
    {
        $this->wpdb->last_error = '';
    }

    /**
     * Drop the wpdb query log in case it's active.
     * We don't want these stacking up and consuming memory.
     */
    private function discard_query_log(): void
    {
        if (isset($this->wpdb->queries) && is_array($this->wpdb->queries)) {
            $this->wpdb->queries = [];
        }
    }

    private function get_last_error(): string
    {
        return (string) ($this->wpdb->last_error ?? '');
    }

    private function substitute_placeholders(string $sql, $params): string
    {
        if ($params === null || count($params) === 0) {
            return $sql;
        }

        $positions = [];
        $len = strlen($sql);
        $in_single = false;
        $in_double = false;
        $escape_next = false;
        for ($i = 0; $i < $len; $i++) {
            if ($escape_next) {
                $escape_next = false;
                continue;
            }
            $ch = $sql[$i];
            if (($in_single || $in_double) && $ch === '\\') {
                $escape_next = true;
                continue;
            }
            if ($ch === "'" && !$in_double) {
                $in_single = !$in_single;
            } elseif ($ch === '"' && !$in_single) {
                $in_double = !$in_double;
            } elseif ($ch === '?' && !$in_single && !$in_double) {
                $positions[] = $i;
            }
        }

        for ($i = count($positions) - 1; $i >= 0; $i--) {
            if (!array_key_exists($i, $params)) {
                continue;
            }
            $quoted = $this->quote_value($params[$i]);
            $sql = substr_replace($sql, $quoted, $positions[$i], 1);
        }

        foreach ($params as $key => $value) {
            if (!is_string($key)) {
                continue;
            }
            $name = ltrim($key, ':');
            if ($name === '') {
                continue;
            }
            $pattern = '/:' . preg_quote($name, '/') . '(?![A-Za-z0-9_])/';
            $sql = preg_replace_callback(
                $pattern,
                function () use ($value) {
                    return $this->quote_value($value);
                },
                $sql
            );
        }

        return $sql;
    }

    private function quote_value($value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        return "'" . $this->wpdb->_real_escape((string) $value) . "'";
    }
}
