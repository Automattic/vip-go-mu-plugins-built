<?php

namespace WordPress\Reprint\Server;

use RuntimeException;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Database errors are protocol text, not HTML.

/** Dedicated mysqli connection with the PDO operations used by database push. */
class MysqliDriverPDO {
    /** @var \mysqli */
    private $database;
    /** @var bool */
    private $buffered = true;
    /** @var bool */
    private $transaction_open = false;

    public function __construct(string $dsn, string $user, string $password) {
        $settings = Utils::parse_pdo_dsn($dsn);
        $this->database = mysqli_init();
        if (!$this->database->real_connect($settings['host'] ?? 'localhost', $user, $password, $settings['dbname'] ?? '', (int) ( $settings['port'] ?? ini_get('mysqli.default_port') ), $settings['unix_socket'] ?? null)) {
            throw new RuntimeException('Cannot connect to MySQL: ' . $this->database->connect_error);
        }
        if (!$this->database->set_charset($settings['charset'] ?? 'utf8mb4')) {
            throw new RuntimeException('Cannot set the MySQL connection charset: ' . $this->database->error);
        }
    }

    public function query(string $sql): MysqliDriverPDOStatement {
        $result = $this->database->query($sql, $this->buffered ? MYSQLI_STORE_RESULT : MYSQLI_USE_RESULT);
        if ($result === false) {
            throw new RuntimeException('MySQL query failed: ' . $this->database->error);
        }
        return new MysqliDriverPDOStatement($this->database, null, $result instanceof \mysqli_result ? $result : null);
    }

    public function prepare(string $sql): MysqliDriverPDOStatement {
        $statement = $this->database->prepare($sql);
        if ($statement === false) {
            throw new RuntimeException('Cannot prepare MySQL statement: ' . $this->database->error);
        }
        return new MysqliDriverPDOStatement($this->database, $statement);
    }

    public function exec(string $sql): int {
        // Never enable mysqli multi_query for client-supplied DDL.
        $result = $this->database->query($sql);
        if ($result === false) {
            throw new RuntimeException('MySQL statement failed: ' . $this->database->error);
        }
        if ($result instanceof \mysqli_result) {
            $result->free();
        }
        return max(0, $this->database->affected_rows);
    }

    public function beginTransaction(): bool {
        $this->exec('START TRANSACTION');
        $this->transaction_open = true;
        return true;
    }

    public function commit(): bool {
        $this->exec('COMMIT');
        $this->transaction_open = false;
        return true;
    }

    public function rollBack(): bool {
        $this->exec('ROLLBACK');
        $this->transaction_open = false;
        return true;
    }

    public function inTransaction(): bool {
        return $this->transaction_open;
    }

    public function quote(string $value): string {
        return "'" . $this->database->real_escape_string($value) . "'";
    }

    /** Controls source streaming without requiring PDO's MySQL extension. */
    public function set_buffered(bool $buffered): void {
        $this->buffered = $buffered;
    }
}
