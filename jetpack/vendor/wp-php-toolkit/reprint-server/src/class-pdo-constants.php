<?php

namespace WordPress\Reprint\Server;

/**
 * Provides PDO constants needed by adapters which also run without ext-pdo.
 */
class PdoConstants {
    public static function fetch_assoc(): int
    {
        return defined('PDO::FETCH_ASSOC') ? constant('PDO::FETCH_ASSOC') : 2;
    }

    public static function fetch_column(): int
    {
        return defined('PDO::FETCH_COLUMN') ? constant('PDO::FETCH_COLUMN') : 7;
    }

    public static function param_str(): int
    {
        return defined('PDO::PARAM_STR') ? constant('PDO::PARAM_STR') : 2;
    }
}
