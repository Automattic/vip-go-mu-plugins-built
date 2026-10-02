<?php

declare(strict_types=1);

namespace WP\McpSchema;

use WP\McpSchema\Exception\UnknownFieldException;

/**
 * Immutable base for generated named MCP records.
 */
abstract class Record implements \JsonSerializable
{
    /** @var array<string, mixed> */
    private $values;

    /** @var array<string, true> */
    private $present;

    /** @var array<string, true> */
    private $declared;

    /**
     * @param array<string, mixed> $values
     * @param array<int, string>   $declaredFields
     */
    final protected function __construct(array $values, array $declaredFields)
    {
        $this->values   = $values;
        $this->present  = array_fill_keys(array_keys($values), true);
        $this->declared = array_fill_keys($declaredFields, true);
    }

    /**
     * @return mixed
     */
    final public function get(string $field)
    {
        if (! isset($this->declared[$field]) && ! isset($this->present[$field])) {
            throw UnknownFieldException::forField(static::class, $field);
        }

        if (! isset($this->present[$field])) {
            return null;
        }

        return self::copyValue($this->values[$field]);
    }

    final public function has(string $field): bool
    {
        return isset($this->present[$field]);
    }

    /**
     * @return \stdClass
     */
    #[\ReturnTypeWillChange]
    final public function jsonSerialize()
    {
        $output = new \stdClass();
        foreach ($this->values as $field => $value) {
            $output->{$field} = self::copyValue($value);
        }

        return $output;
    }

    /**
     * Read a generated getter field only when the selected catalog declared it.
     *
     * @return mixed
     */
    final protected function declaredValue(string $field)
    {
        if (! isset($this->declared[$field]) || ! isset($this->present[$field])) {
            return null;
        }

        return self::copyValue($this->values[$field]);
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private static function copyValue($value)
    {
        if ($value instanceof self) {
            return $value;
        }
        if (is_array($value)) {
            $copy = array();
            foreach ($value as $key => $item) {
                $copy[$key] = self::copyValue($item);
            }

            return $copy;
        }
        if ($value instanceof \stdClass) {
            $copy = new \stdClass();
            foreach (get_object_vars($value) as $key => $item) {
                $copy->{$key} = self::copyValue($item);
            }

            return $copy;
        }

        return $value;
    }
}
