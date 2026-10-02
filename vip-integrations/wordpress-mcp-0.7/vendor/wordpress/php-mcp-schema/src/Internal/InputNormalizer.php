<?php

declare(strict_types=1);

namespace WP\McpSchema\Internal;

use WP\McpSchema\Exception\ValidationException;
use WP\McpSchema\Record;

/**
 * Copies supported PHP/decoded-JSON values and rejects unsafe native values.
 *
 * @internal
 */
final class InputNormalizer
{
    public const MAX_DEPTH = 512;

    /** @var \SplObjectStorage<object, true> */
    private $activeObjects;

    /** @var array<string, true> */
    private $activeArrayReferences = array();

    /** @var bool */
    private $programmaticArrays;

    public function __construct(bool $programmaticArrays)
    {
        $this->activeObjects      = new \SplObjectStorage();
        $this->programmaticArrays = $programmaticArrays;
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    public function normalize($value)
    {
        return $this->normalizeValue($value, '', 0);
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private function normalizeValue(&$value, string $pointer, int $depth)
    {
        if ($depth > self::MAX_DEPTH) {
            throw new ValidationException($pointer, 'Value exceeds the maximum nesting depth.');
        }
        if (is_string($value) && preg_match('//u', $value) !== 1) {
            throw new ValidationException($pointer, 'String contains malformed UTF-8.');
        }
        if (is_float($value) && ! is_finite($value)) {
            throw new ValidationException($pointer, 'Numbers must be finite.');
        }
        if (is_resource($value)) {
            throw new ValidationException($pointer, 'Resources are not valid JSON values.');
        }
        if (is_array($value)) {
            if (! $this->programmaticArrays && ! self::isList($value)) {
                throw new ValidationException($pointer, 'Decoded JSON arrays must be lists; use stdClass for objects.');
            }

            return $this->normalizeArray($value, $pointer, $depth);
        }
        if ($value instanceof Record) {
            $serialized = $value->jsonSerialize();

            return $this->normalizeObject($serialized, $pointer, $depth);
        }
        if ($value instanceof \stdClass) {
            return $this->normalizeObject($value, $pointer, $depth);
        }
        if (is_object($value)) {
            throw new ValidationException($pointer, sprintf('%s is not a supported JSON value.', get_class($value)));
        }
        if ($value === null || is_bool($value) || is_int($value) || is_float($value) || is_string($value)) {
            return $value;
        }

        throw new ValidationException($pointer, sprintf('Unsupported PHP value of type %s.', gettype($value)));
    }

    /**
     * @param array<mixed> $value
     * @return array<mixed>
     */
    private function normalizeArray(array &$value, string $pointer, int $depth): array
    {
        foreach ($value as $key => $item) {
            if (is_string($key)) {
                self::assertSafeObjectKey($key, $pointer);
            }
            $reference = \ReflectionReference::fromArrayElement($value, $key);
            if ($reference !== null) {
                return $this->normalizeArrayWithReferences($value, $pointer, $depth);
            }

            $value[$key] = $this->normalizeValue(
                $item,
                self::appendPointer($pointer, (string) $key),
                $depth + 1
            );
        }

        return $value;
    }

    /**
     * Preserve caller-owned PHP reference semantics on the uncommon reference
     * path while retaining cycle detection.
     *
     * @param array<mixed> $value
     * @return array<mixed>
     */
    private function normalizeArrayWithReferences(array &$value, string $pointer, int $depth): array
    {
        $output = array();
        foreach ($value as $key => $item) {
            if (is_string($key)) {
                self::assertSafeObjectKey($key, $pointer);
            }
            $reference = \ReflectionReference::fromArrayElement($value, $key);
            if ($reference === null) {
                $output[$key] = $this->normalizeValue(
                    $item,
                    self::appendPointer($pointer, (string) $key),
                    $depth + 1
                );
                continue;
            }

            $referenceId = $reference->getId();
            if (isset($this->activeArrayReferences[$referenceId])) {
                throw new ValidationException(self::appendPointer($pointer, (string) $key), 'Cyclic arrays are not supported.');
            }
            $this->activeArrayReferences[$referenceId] = true;
            $output[$key] = $this->normalizeValue(
                $item,
                self::appendPointer($pointer, (string) $key),
                $depth + 1
            );

            unset($this->activeArrayReferences[$referenceId]);
        }

        return $output;
    }

    private function normalizeObject(\stdClass $value, string $pointer, int $depth): \stdClass
    {
        if ($this->activeObjects->offsetExists($value)) {
            throw new ValidationException($pointer, 'Cyclic objects are not supported.');
        }
        $this->activeObjects->offsetSet($value, true);

        $output = new \stdClass();
        foreach (get_object_vars($value) as $key => $item) {
            if (is_string($key)) {
                self::assertSafeObjectKey($key, $pointer);
            }
            $output->{$key} = $this->normalizeValue(
                $item,
                self::appendPointer($pointer, (string) $key),
                $depth + 1
            );
        }

        $this->activeObjects->offsetUnset($value);

        return $output;
    }

    /**
     * @param array<mixed> $value
     */
    public static function isList(array $value): bool
    {
        $expected = 0;
        foreach ($value as $key => $_item) {
            if ($key !== $expected) {
                return false;
            }
            ++$expected;
        }

        return true;
    }

    public static function appendPointer(string $pointer, string $segment): string
    {
        return $pointer . '/' . str_replace(array('~', '/'), array('~0', '~1'), $segment);
    }

    private static function assertSafeObjectKey(string $key, string $pointer): void
    {
        $keyPointer = self::appendPointer($pointer, $key);
        if ($key !== '' && $key[0] === "\0") {
            throw new ValidationException($keyPointer, 'Object keys must not start with a NUL byte.');
        }
        if (preg_match('//u', $key) !== 1) {
            throw new ValidationException($keyPointer, 'Object key contains malformed UTF-8.');
        }
    }
}
