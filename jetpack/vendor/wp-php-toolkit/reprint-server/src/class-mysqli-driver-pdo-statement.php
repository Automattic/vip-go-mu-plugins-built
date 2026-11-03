<?php

namespace WordPress\Reprint\Server;

use RuntimeException;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Database errors are protocol text, not HTML.

/** Native prepared parameters and result binding, including hosts without mysqlnd. */
class MysqliDriverPDOStatement {
    /** @var \mysqli */
    private $database;
    /** @var \mysqli_stmt|null */
    private $statement;
    /** @var \mysqli_result|null */
    private $result;
    /** @var array<int,mixed> */
    private $parameters = [];
    /** @var array<int,string> */
    private $types = [];
    /** @var array<int,string> */
    private $columns = [];
    /** @var array<int,mixed> */
    private $values = [];

    public function __construct(\mysqli $database, ?\mysqli_stmt $statement, ?\mysqli_result $result = null) {
        $this->database = $database;
        $this->statement = $statement;
        $this->result = $result;
    }

    public function bindValue(int $position, $value, int $type = 2): bool {
        $this->parameters[$position - 1] = $value;
        $this->types[$position - 1] = $type === 1 ? 'i' : 's';
        return true;
    }

    /** @param array<int,mixed>|null $parameters Positional values; null reuses bindValue(). */
    public function execute(?array $parameters = null): bool {
        $statement = $this->statement;
        if ($statement === null) {
            throw new RuntimeException('Only prepared MySQL statements can be executed again.');
        }
        if ($parameters !== null) {
            $this->parameters = array_values($parameters);
            $this->types = array_fill(0, count($parameters), 's');
        }
        if ($this->parameters !== []) {
            ksort($this->parameters);
            ksort($this->types);
            $arguments = [implode('', $this->types)];
            foreach ($this->parameters as &$value) {
                $arguments[] = &$value;
            }
            unset($value);
            if (!call_user_func_array([$statement, 'bind_param'], $arguments)) {
                throw new RuntimeException('Cannot bind MySQL values: ' . $statement->error);
            }
        }
        if (!$statement->execute()) {
            throw new RuntimeException('MySQL prepared statement failed: ' . $statement->error);
        }
        $metadata = $statement->result_metadata();
        $this->columns = [];
        $this->values = [];
        if ($metadata !== false) {
            // Bound metadata queries are small; buffering frees the connection
            // before the caller saves progress. Source rows use query() streaming.
            $statement->store_result();
            $arguments = [];
            foreach ($metadata->fetch_fields() as $index => $field) {
                $this->columns[] = $field->name;
                $this->values[$index] = null;
                $arguments[$index] = &$this->values[$index];
            }
            $metadata->free();
            if (!call_user_func_array([$statement, 'bind_result'], $arguments)) {
                throw new RuntimeException('Cannot bind MySQL results: ' . $statement->error);
            }
        }
        return true;
    }

    /** @return array|false One row in PDO-compatible FETCH_ASSOC, FETCH_NUM, or FETCH_BOTH mode. */
    public function fetch(int $mode = 4) {
        if ($this->result !== null) {
            $row = $this->result->fetch_assoc();
        } elseif ($this->statement !== null && $this->columns !== []) {
            $fetched = $this->statement->fetch();
            if ($fetched === false) {
                throw new RuntimeException('Cannot fetch MySQL row: ' . $this->statement->error);
            }
            $row = null;
            if ($fetched !== null) {
                $row = [];
                foreach ($this->columns as $index => $name) {
                    // Copy each bound value, not its reference: the next fetch
                    // must not change rows already returned to the caller.
                    $row[$name] = $this->values[$index];
                }
            }
        } else {
            $row = null;
        }
        if ($row === null) {
            return false;
        }
        return $mode === 2 ? $row : ( $mode === 3 ? array_values($row) : $row + array_values($row) );
    }

    public function fetchColumn(int $column = 0) {
        $row = $this->fetch(3);
        return $row === false ? false : $row[$column];
    }

    public function fetchAll(int $mode = 4): array {
        $rows = [];
        // phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition -- Consume one result row per iteration.
        while (( $row = $this->fetch($mode === 7 ? 3 : $mode) ) !== false) {
            $rows[] = $mode === 7 ? $row[0] : $row;
        }
        return $rows;
    }

    public function rowCount(): int {
        return $this->statement !== null ? $this->statement->affected_rows : $this->database->affected_rows;
    }

    public function closeCursor(): bool {
        if ($this->result !== null) {
            $this->result->free();
            $this->result = null;
        }
        if ($this->statement !== null) {
            $this->statement->free_result();
        }
        $this->columns = [];
        return true;
    }

    public function __destruct() {
        $this->closeCursor();
        if ($this->statement !== null) {
            $this->statement->close();
        }
    }
}
