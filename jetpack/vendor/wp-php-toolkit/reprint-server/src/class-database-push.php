<?php

namespace WordPress\Reprint\Server;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- These errors are protocol or CLI text, never HTML.

use InvalidArgumentException;
use PDO;
use RuntimeException;

/**
 * Imports one streamed record per call, then exchanges all site tables together.
 *
 * Rows and the source cursor commit in the same InnoDB transaction. CREATE
 * TABLE uses IF NOT EXISTS; foreign-key ALTER checks the constraint name before
 * replay. The progress table participates in cutover, so a lost response cannot
 * repeat it.
 * Callers must keep application requests and all other writers stopped during
 * commit, inspection, and cache clearing. This class cannot stop those actors.
 */
final class DatabasePush {
    public const MAX_RECORD_BYTES = 2097152;
    public const MAX_TABLES = 256;

    /** @var PDO|MysqliDriverPDO */
    private $database;
    /** @var string */
    private $table_prefix;
    /** @var string */
    private $private_prefix;
    /** @var string */
    private $lock_name;
    /** @var array<string,mixed>|null */
    private $state;
    /** @var string|null One bounded, incomplete record, never a database archive. */
    private $partial_record;
    /** @var string|null */
    private $progress_table;
    /** @var bool */
    private $closed = false;

    /** @param PDO|MysqliDriverPDO $database Dedicated target connection. */
    public function __construct($database, string $table_prefix, string $push_session_id) {
        if (!preg_match('/^[a-f0-9]{32}$/D', $push_session_id)) {
            throw new InvalidArgumentException('Database push requires a 32-character hexadecimal push session ID.');
        }
        if (!preg_match('/^[a-zA-Z0-9_]+$/D', $table_prefix) || strlen($table_prefix) > 32 || ( strpos('__reprint_db_', $table_prefix) === 0 || strpos($table_prefix, '__reprint_db_') === 0 )) {
            throw new InvalidArgumentException('Database push requires 1–32 letters, digits, or underscores in its table prefix, without overlap with the reserved __reprint_db_ prefix.');
        }
        $this->database = $database;
        $this->table_prefix = $table_prefix;
        $this->private_prefix = '__reprint_db_' . $push_session_id . '_';
        // Explicit extra tables can overlap selections with different prefixes.
        // Serialize requests for the whole database, not just one prefix.
        $this->lock_name = 'reprint-db-' . substr(hash('sha256', $database->query('SELECT DATABASE()')->fetchColumn()), 0, 40);
        $statement = $database->prepare('SELECT GET_LOCK(?, 0)');
        $statement->execute([$this->lock_name]);
        if ( (int) $statement->fetchColumn() !== 1) {
            throw new PushException('busy', 'Another database push request is still running for this database. Run the command again after it finishes.');
        }
        // Do not inherit exporter AUTOCOMMIT=0 or a permissive SQL mode.
        // Host engine overrides must not replace InnoDB progress with MyISAM.
        $database->exec("SET SESSION sql_mode='STRICT_ALL_TABLES,NO_AUTO_VALUE_ON_ZERO,NO_ENGINE_SUBSTITUTION', autocommit=1, foreign_key_checks=1, lock_wait_timeout=5, time_zone='+00:00'");
    }

    /** @param list<string> $extra_tables Explicitly selected tables outside the WordPress prefix. */
    public function start(array $extra_tables = []): void {
        $this->assert_open();
        $extra_tables = self::normalize_extra_tables($extra_tables, $this->table_prefix);
        if ($this->table_exists($this->private_prefix . 'state') || $this->table_exists($this->private_prefix . 'done')) {
            $state = $this->load_state();
            // CREATE may have finished before the initial state row was saved.
            if ( (int) $this->database->query('SELECT COUNT(*) FROM ' . self::identifier($this->progress_table) . ' WHERE id=1')->fetchColumn() !== 0) {
                if ($state['extra_tables'] !== $extra_tables) {
                    throw new RuntimeException('Database push extra table selection changed. Use the original selection or a new state directory.');
                }
                return;
            }
        }
        $this->assert_supported_target($extra_tables);
        $this->progress_table = $this->private_prefix . 'state';
        $this->database->exec('CREATE TABLE IF NOT EXISTS ' . self::identifier($this->private_prefix . 'state') . ' (id int PRIMARY KEY, state longtext NOT NULL, partial_record longblob NOT NULL) ENGINE=InnoDB');
        // A process may stop after CREATE but before INSERT. load_state() also
        // supplies this initial state when the progress table is still empty.
        $state = $this->initial_state();
        $state['extra_tables'] = $extra_tables;
        $this->save_state($state);
    }

    /**
     * Accepts one bounded piece of a database record. A record may span requests.
     *
     * A new client process restarts its first unconfirmed record at offset zero,
     * because the source row may have changed. An uninterrupted client can keep
     * its one encoded record and continue it across successful requests.
     */
    public function accept_record_chunk(int $record_number, int $total_bytes, int $offset, string $chunk): void {
        $state = $this->load_state();
        if ($state['phase'] !== 'importing' || $record_number !== $state['records']) {
            throw new RuntimeException('Expected database record ' . $state['records'] . ' in importing phase; received ' . $record_number . ' in ' . $state['phase'] . '.');
        }
        if ($total_bytes <= 0 || $total_bytes > self::MAX_RECORD_BYTES || $offset < 0 || $offset + strlen($chunk) > $total_bytes) {
            throw new RuntimeException('Database record has total ' . $total_bytes . ', offset ' . $offset . ', and chunk length ' . strlen($chunk) . '; records must fit within 2 MiB.');
        }
        if ($offset === 0) {
            $this->partial_record = '';
        } elseif ($this->partial_record === null) {
            $this->partial_record = (string) $this->database->query('SELECT partial_record FROM ' . self::identifier($this->progress_table) . ' WHERE id=1')->fetchColumn();
        }
        if (strlen($this->partial_record) !== $offset) {
            throw new RuntimeException('Database record chunk starts at ' . $offset . ' but the target has ' . strlen($this->partial_record) . ' bytes. Resume from the target source cursor.');
        }
        $this->partial_record .= $chunk;
        if (strlen($this->partial_record) === $total_bytes) {
            $record = json_decode($this->partial_record, true);
            if (!is_array($record)) {
                throw new RuntimeException('Database stream record is not a JSON object.');
            }
            $this->import_record($record);
            $this->partial_record = '';
        }
    }

    /** Save only the one incomplete record after a fully received request. */
    public function finish_record_request(): void {
        if ($this->partial_record !== null && $this->partial_record !== '') {
            $statement = $this->database->prepare('UPDATE ' . self::identifier($this->progress_table) . ' SET partial_record=? WHERE id=1');
            $statement->execute([$this->partial_record]);
        }
    }

    /**
     * @param array $record {
     *     One client-prepared record.
     *     @type array $cursor Source position after this record, saved with its rows.
     *     @type string $table Site table name for CREATE or a foreign key.
     *     @type string $ddl Client-prepared CREATE TABLE statement.
     *     @type string $foreign_key Private deferred constraint name.
     *     @type string $definition FOREIGN KEY clause with incoming table references.
     *     @type array $values Column names mapped to encoded values.
     *     @type bool $end True only after all tables, rows, and foreign keys.
     * }
     */
    public function import_record(array $record): void {
        $this->assert_open();
        $state = $this->load_state();
        if ($state['phase'] !== 'importing') {
            throw new RuntimeException('Database records require importing phase; observed ' . $state['phase'] . '.');
        }
        if (!is_array($record['cursor'] ?? null) || strlen(json_encode($record['cursor'])) > 32768) {
            throw new RuntimeException('Database record requires a source cursor of at most 32 KiB.');
        }
        $state['cursor'] = $record['cursor'];
        ++$state['records'];
        if (isset($record['foreign_key'])) {
            $table = $record['table'];
            $incoming = $state['tables'][$table] ?? null;
            if ($incoming === null || strpos($record['foreign_key'], $incoming . '_fk_') !== 0) {
                throw new RuntimeException('Foreign key record must name an incoming table and its private constraint.');
            }
            // ALTER commits implicitly. A new request checks the constraint
            // before replaying a record whose cursor was not saved yet.
            $statement = $this->database->prepare("SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME=? AND CONSTRAINT_TYPE='FOREIGN KEY'");
            $statement->execute([$incoming, $record['foreign_key']]);
            if ( (int) $statement->fetchColumn() === 0) {
                // TODO: validate client-prepared DDL with a server-side parser.
                // The opt-in host route currently trusts the authenticated client.
                $this->database->exec('ALTER TABLE ' . self::identifier($incoming) . ' ADD CONSTRAINT ' . self::identifier($record['foreign_key']) . ' ' . $record['definition']);
            }
        } elseif (isset($record['table'])) {
            $table = $record['table'];
            self::validate_identifier($table);
            if (( strpos($table, $this->table_prefix) !== 0 && !in_array($table, $state['extra_tables'], true) ) || isset($state['tables'][$table]) || count($state['tables']) >= self::MAX_TABLES) {
                throw new RuntimeException('Stream table is repeated, outside the selected tables, or exceeds the 256-table limit: ' . $table);
            }
            $incoming = $this->private_prefix . 't' . count($state['tables']);
            $ddl = $record['ddl'] ?? '';
            $head = 'CREATE TABLE ' . self::identifier($table) . ' (';
            if (strpos($ddl, $head) !== 0) {
                throw new RuntimeException('Stream table definition must begin with ' . $head);
            }
            // TODO: validate client-prepared DDL with a server-side parser.
            // Keyword matching cannot distinguish SQL from names or literals.
            $tail = substr($ddl, strlen('CREATE TABLE ' . self::identifier($table)));
            $this->database->exec('CREATE TABLE IF NOT EXISTS ' . self::identifier($incoming) . $tail);
            $statement = $this->database->prepare('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?');
            $statement->execute([$incoming]);
            if ($statement->fetchColumn() !== 'InnoDB') {
                throw new RuntimeException('Incoming table must use InnoDB: ' . $incoming . '.');
            }
            $state['tables'][$table] = $incoming;
            $state['current_table'] = $incoming;
        } elseif (isset($record['values']) && is_array($record['values']) && $state['current_table'] !== null) {
            $columns = [];
            $values = [];
            $expressions = [];
            $enum_zero_warnings = [];
            foreach ($record['values'] as $column => $encoded) {
                $columns[] = self::identifier($column);
                if (is_array($encoded) && isset($encoded['unsigned'])) {
                    $value = $encoded['unsigned'];
                    if (!is_string($value) || !preg_match('/^(0|[1-9][0-9]{0,19})$/D', $value)
                        || ( strlen($value) === 20 && strcmp($value, '18446744073709551615') > 0 )) {
                        throw new RuntimeException('Stream column ' . $column . ' requires an unsigned 64-bit decimal integer.');
                    }
                    $expressions[] = 'CAST(? AS UNSIGNED)';
                    $values[] = $value;
                    continue;
                }
                if (is_array($encoded)) {
                    $value = base64_decode($encoded['wkb'] ?? '', true);
                    if ($value === false || !isset($encoded['srid']) || !is_int($encoded['srid']) || $encoded['srid'] < 0 || $encoded['srid'] > 4294967295) {
                        throw new RuntimeException('Stream spatial column ' . $column . ' requires base64 WKB and an unsigned 32-bit SRID.');
                    }
                    // MariaDB rejects text-typed WKB parameters even when their bytes are valid.
                    $expressions[] = 'ST_GeomFromWKB(CAST(? AS BINARY),?)';
                    $values[] = $value;
                    $values[] = (string) $encoded['srid'];
                    continue;
                }
                $expressions[] = '?';
                $value = $encoded === null || $encoded === 0 ? $encoded : base64_decode($encoded, true);
                if ($value === false) {
                    throw new RuntimeException('Stream column ' . $column . ' is not valid base64.');
                }
                $values[] = $value;
                if ($value === 0) {
                    $enum_zero_warnings[] = "Data truncated for column '" . $column . "' at row 1";
                }
            }
            $this->database->beginTransaction();
            try {
                // IGNORE is needed only to restore legacy ENUM index zero.
                // Accept exactly its named warnings, never other truncation,
                // skipped duplicates, or an incomplete server warning list.
                $insert = $enum_zero_warnings === [] ? 'INSERT INTO ' : 'INSERT IGNORE INTO ';
                $statement = $this->database->prepare($insert . self::identifier($state['current_table']) . ' (' . implode(',', $columns) . ') VALUES (' . implode(',', $expressions) . ')');
                foreach ($values as $position => $value) {
                    // Integer zero restores ENUM index zero even if "0" is
                    // itself a declared label. All other values remain bytes.
                    $type = $value === 0 ? PdoConstants::param_int() : ( $value === null ? PdoConstants::param_null() : PdoConstants::param_str() );
                    $statement->bindValue($position + 1, $value, $type);
                }
                $statement->execute();
                if ($enum_zero_warnings !== []) {
                    // MySQL cannot prepare these diagnostic statements. PDO's
                    // fallback would replace the INSERT warnings with error 1295.
                    if ($this->database instanceof PDO) {
                        $this->database->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
                    }
                    try {
                        $warning_count = (int) $this->database->query('SHOW COUNT(*) WARNINGS')->fetchColumn();
                        $warnings = $this->database->query('SHOW WARNINGS')->fetchAll(PdoConstants::fetch_assoc());
                    } finally {
                        if ($this->database instanceof PDO) {
                            $this->database->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                        }
                    }
                    if ($statement->rowCount() !== 1 || $warning_count !== count($warnings) || $warning_count !== count($enum_zero_warnings)) {
                        throw new RuntimeException('Restoring ENUM index zero inserted ' . $statement->rowCount() . ' rows with ' . $warning_count . ' warnings (' . count($warnings) . ' available); expected one row and ' . count($enum_zero_warnings) . ' warnings.');
                    }
                    foreach ($warnings as $warning) {
                        if ( (int) $warning['Code'] !== 1265 || !in_array($warning['Message'], $enum_zero_warnings, true)) {
                            throw new RuntimeException('Database row warning while restoring ENUM index zero: ' . $warning['Message']);
                        }
                    }
                }
                $this->save_state($state);
                $this->database->commit();
                $this->state = $state;
            } catch (\Throwable $exception) {
                $this->database->rollBack();
                throw $exception;
            }
            return;
        } elseif (( $record['end'] ?? false ) === true && $state['tables'] !== []) {
            $state['phase'] = 'ready';
        } else {
            throw new RuntimeException('Unexpected database stream record.');
        }
        $this->save_state($state);
    }

    public function commit(): void {
        $this->assert_open();
        $state = $this->load_state();
        if (in_array($state['phase'], ['committed', 'complete'], true)) {
            return;
        }
        if ($state['phase'] !== 'ready') {
            throw new RuntimeException('Database push must be ready before committing; observed ' . $state['phase'] . '.');
        }
        $live_tables = $this->assert_supported_target($state['extra_tables']);
        $renames = [];
        $state['old_tables'] = [];
        foreach ($live_tables as $index => $table) {
            $old = $this->private_prefix . 'o' . $index;
            $renames[] = self::identifier($table) . ' TO ' . self::identifier($old);
            $state['old_tables'][] = $old;
        }
        foreach ($state['tables'] as $table => $incoming) {
            $renames[] = self::identifier($incoming) . ' TO ' . self::identifier($table);
        }
        $renames[] = self::identifier($this->private_prefix . 'state') . ' TO ' . self::identifier($this->private_prefix . 'done');
        // Store the old-table list first. RENAME either leaves this state table
        // here or moves it with every other table. No filesystem checkpoint can
        // reliably distinguish those outcomes after a lost database response.
        $this->save_state($state);
        $this->database->exec('RENAME TABLE ' . implode(', ', $renames));
        $this->progress_table = $this->private_prefix . 'done';
        $state['phase'] = 'committed';
        $this->state = $state;
    }

    public function discard_next_table(): void {
        $state = $this->load_state();
        if ($state['phase'] === 'discarded') {
            return;
        }
        if (in_array($state['phase'], ['committed', 'complete'], true)) {
            throw new RuntimeException('A committed overwrite cannot be discarded. Inspect the site before cleaning retained old tables.');
        }
        if ($state['phase'] !== 'discarding') {
            // CREATE may have completed before its progress row was saved.
            $state['discard_tables'] = array_merge(array_values($state['tables']), [$this->private_prefix . 't' . count($state['tables'])]);
            $state['phase'] = 'discarding';
        } elseif ($state['discard_tables'] !== []) {
            $table = array_shift($state['discard_tables']);
            $this->drop_private_table($table);
        } else {
            $state['phase'] = 'discarded';
        }
        $this->save_state($state);
    }

    public function cleanup_next_table(): void {
        $this->assert_open();
        $state = $this->load_state();
        if ($state['phase'] === 'complete') {
            return;
        }
        if ($state['phase'] !== 'committed') {
            throw new RuntimeException('Old tables can only be removed after database push committed.');
        }
        if ($state['old_tables'] !== []) {
            $table = array_shift($state['old_tables']);
            // Replaying a DROP after process death is harmless.
            $this->drop_private_table($table);
        } else {
            $state['phase'] = 'complete';
        }
        $this->save_state($state);
    }

    /**
     * @return array {
     *     Progress read under the database lock.
     *     @type string $phase importing, ready, committed, complete, discarding, or discarded.
     *     @type int $records Number of applied records.
     *     @type array|null $cursor Target-confirmed source position.
     *     @type int $partial_bytes Saved bytes of the one incomplete record.
     *     @type list<string> $extra_tables Explicit selection outside the WordPress prefix.
     *     @type list<string> $incoming_tables Final site names for incoming tables.
     *     @type list<string> $replace_tables Current live site table names when ready.
     *     @type list<string> $old_tables Private names retained after commit.
     *     @type list<string> $warnings Overwrite warnings to show with the ready table review.
     * }
     */
    public function get_status(): array {
        $state = $this->load_state();
        return [
            'phase' => $state['phase'],
            'records' => $state['records'],
            'cursor' => $state['cursor'],
            'partial_bytes' => (int) $this->database->query('SELECT OCTET_LENGTH(partial_record) FROM ' . self::identifier($this->progress_table) . ' WHERE id=1')->fetchColumn(),
            'extra_tables' => $state['extra_tables'],
            'incoming_tables' => array_keys($state['tables']),
            'replace_tables' => $state['phase'] === 'ready' ? $this->assert_supported_target($state['extra_tables']) : [],
            'old_tables' => in_array($state['phase'], ['committed', 'complete'], true) ? $state['old_tables'] : [],
            'warnings' => $state['phase'] === 'ready' ? ['Triggers are not copied. After commit, the new live tables will have no triggers.'] : [],
        ];
    }

    public function close(): void {
        if (!$this->closed) {
            $this->partial_record = null;
            $this->closed = true;
            $statement = $this->database->prepare('SELECT RELEASE_LOCK(?)');
            $statement->execute([$this->lock_name]);
        }
    }

    public static function identifier(string $name): string {
        self::validate_identifier($name);
        return '`' . $name . '`';
    }

    /** Reject names outside the database push identifier format without returning SQL. */
    public static function validate_identifier(string $name): void {
        if (!preg_match('/^[a-zA-Z0-9_]{1,64}$/D', $name)) {
            throw new InvalidArgumentException('Database push SQL identifier must contain 1–64 letters, digits, or underscores: ' . $name . '.');
        }
    }

    /**
     * @param list<string> $tables Requested additional table names; no patterns.
     * @param string $table_prefix Tables with this prefix are already selected.
     * @return list<string> Sorted, distinct extra names, excluding redundant prefixed names.
     */
    public static function normalize_extra_tables(array $tables, string $table_prefix): array {
        if (count($tables) > self::MAX_TABLES) {
            throw new InvalidArgumentException('Database push supports at most 256 explicitly included tables.');
        }
        $extra_tables = [];
        foreach ($tables as $table) {
            if (!is_string($table)) {
                throw new InvalidArgumentException('An included table name must be a string; observed ' . gettype($table) . '.');
            }
            self::validate_identifier($table);
            if (stripos($table, '__reprint_db_') === 0 || MultisiteDatabaseSelection::is_internal_table($table)) {
                throw new InvalidArgumentException('Database push cannot include its internal table ' . $table . '.');
            }
            if (strpos($table, $table_prefix) !== 0) {
                $extra_tables[] = $table;
            }
        }
        $extra_tables = array_values(array_unique($extra_tables));
        sort($extra_tables, SORT_STRING);
        return $extra_tables;
    }

    /**
     * @param list<string> $extra_tables Saved explicit selection outside the prefix.
     * @return list<string> Supported current selected table names in sorted order.
     */
    public function assert_supported_target(array $extra_tables = []): array {
        $version = (string) $this->database->query('SELECT VERSION()')->fetchColumn();
        $minimum = stripos($version, 'MariaDB') !== false ? '10.6.1' : '8.0.0';
        if (version_compare($version, $minimum, '<')) {
            throw new RuntimeException('Database push requires MySQL 8.0+ or MariaDB 10.6.1+; observed ' . $version . '.');
        }
        // information_schema's default collation ignores case even when the
        // server supports distinct wp_ and WP_ sites. Scope uses exact bytes.
        $statement = $this->database->prepare('SELECT TABLE_NAME, ENGINE, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND ' . $this->table_selection_sql('TABLE_NAME', $extra_tables) . ' ORDER BY BINARY TABLE_NAME LIMIT 257');
        $parameters = array_merge([strlen($this->table_prefix), $this->table_prefix], $extra_tables);
        $statement->execute($parameters);
        $tables = $statement->fetchAll(PdoConstants::fetch_assoc());
        if (count($tables) > self::MAX_TABLES) {
            throw new RuntimeException('Database push supports at most 256 site tables.');
        }
        $names = [];
        foreach ($tables as $table) {
            if ($table['ENGINE'] !== 'InnoDB' || $table['TABLE_TYPE'] !== 'BASE TABLE') {
                throw new RuntimeException('Database push requires InnoDB base tables; observed ' . $table['TABLE_NAME'] . '.');
            }
            $name = $table['TABLE_NAME'];
            self::validate_identifier($name);
            $names[] = $name;
        }
        // An unselected table or another schema can still point into this selection.
        $statement = $this->database->prepare('SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND ' . $this->table_selection_sql('REFERENCED_TABLE_NAME', $extra_tables) . ' AND NOT (TABLE_SCHEMA=DATABASE() AND ' . $this->table_selection_sql('TABLE_NAME', $extra_tables) . ')');
        $statement->execute(array_merge($parameters, $parameters));
        if ( (int) $statement->fetchColumn() !== 0) {
            throw new RuntimeException('Another table has a foreign key referencing this site; database push cannot exchange it.');
        }
        foreach (['EVENTS' => 'EVENT_SCHEMA', 'ROUTINES' => 'ROUTINE_SCHEMA'] as $table => $column) {
            if ( (int) $this->database->query('SELECT COUNT(*) FROM information_schema.' . $table . ' WHERE ' . $column . '=DATABASE()')->fetchColumn() !== 0) {
                throw new RuntimeException('Database push does not support a database containing events or routines.');
            }
        }
        return $names;
    }

    /** @param list<string> $extra_tables Saved explicit selection outside the prefix. */
    private function table_selection_sql(string $column, array $extra_tables): string {
        return '(BINARY LEFT(' . $column . ', ?) = ?'
            . ( $extra_tables === [] ? '' : ' OR BINARY ' . $column . ' IN (' . implode(',', array_fill(0, count($extra_tables), '?')) . ')' ) . ')';
    }

    private function drop_private_table(string $table): void {
        // Old and incoming tables may reference each other in either order,
        // including cycles. External inbound references were rejected before
        // staging and commit. Limit disabled checks to this private DROP.
        $this->database->exec('SET SESSION foreign_key_checks=0');
        try {
            $this->database->exec('DROP TABLE IF EXISTS ' . self::identifier($table));
        } finally {
            $this->database->exec('SET SESSION foreign_key_checks=1');
        }
    }

    private function assert_open(): void {
        if ($this->closed) {
            throw new RuntimeException('This database push request is closed.');
        }
    }

    private function table_exists(string $table): bool {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?');
        $statement->execute([$table]);
        return (int) $statement->fetchColumn() === 1;
    }

    /** @return array<string,mixed> Initial stream cursor and table mapping. */
    private function initial_state(): array {
        return ['phase' => 'importing', 'records' => 0, 'cursor' => null, 'tables' => [], 'extra_tables' => [], 'current_table' => null, 'old_tables' => []];
    }

    /** @return array<string,mixed> State read under the database lock. */
    private function load_state(): array {
        $this->assert_open();
        if ($this->state !== null) {
            return $this->state;
        }
        $committed = $this->table_exists($this->private_prefix . 'done');
        $table = $this->private_prefix . ( $committed ? 'done' : 'state' );
        $this->progress_table = $table;
        $json = $this->database->query('SELECT state FROM ' . self::identifier($table) . ' WHERE id=1')->fetchColumn();
        $state = $json === false ? $this->initial_state() : json_decode($json, true);
        if (!is_array($state)) {
            throw new RuntimeException('Database push progress contains invalid JSON.');
        }
        if ($committed && $state['phase'] !== 'complete') {
            $state['phase'] = 'committed';
        }
        $this->state = $state;
        return $state;
    }

    /**
     * @param array $state {
     *     Next stream cursor and table mapping. Row progress shares its data transaction.
     *     @type string $phase Durable phase.
     *     @type int $records Number of applied records.
     *     @type array|null $cursor Client source cursor after the last applied record.
     *     @type list<string> $extra_tables Immutable explicit selection outside the prefix.
     *     @type array<string,string> $tables Final site name mapped to incoming table name.
     *     @type string|null $current_table Incoming table receiving rows, or null before DDL.
     *     @type list<string> $old_tables Private names retained by commit.
     *     @type list<string> $discard_tables Present during discard; pending private tables.
     * }
     */
    private function save_state(array $state): void {
        $table = $this->progress_table ?? $this->private_prefix . 'state';
        $statement = $this->database->prepare('REPLACE INTO ' . self::identifier($table) . ' (id, state, partial_record) VALUES (1, ?, \'\')');
        $statement->execute([json_encode($state)]);
        if (!$this->database->inTransaction()) {
            $this->state = $state;
        }
    }
}
