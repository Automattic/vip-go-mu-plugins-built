<?php

declare(strict_types=1);

namespace WP\McpSchema\Internal;

use WP\McpSchema\Exception\InvalidJsonException;

/**
 * Identity-preserving JSON decoder with lexical native-integer protection.
 *
 * @internal
 */
final class JsonDecoder
{
    public const MAX_DEPTH = InputNormalizer::MAX_DEPTH;

    private const MAX_DIAGNOSTIC_TOKEN_LENGTH = 80;

    /**
     * @return mixed
     */
    public function decode(string $json)
    {
        $this->assertNativeIntegers($json);

        try {
            return json_decode($json, false, self::MAX_DEPTH + 1, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new InvalidJsonException('Invalid JSON: ' . $exception->getMessage(), 0, $exception);
        }
    }

    private function assertNativeIntegers(string $json): void
    {
        $length = strlen($json);
        $index  = 0;

        while ($index < $length) {
            $index += strcspn($json, '"-0123456789', $index);
            if ($index >= $length) {
                break;
            }

            if ($json[$index] === '"') {
                ++$index;
                while ($index < $length) {
                    $index += strcspn($json, '"\\', $index);
                    if ($index >= $length) {
                        break;
                    }
                    if ($json[$index] === '\\') {
                        $index += 2;
                        continue;
                    }
                    ++$index;
                    break;
                }
                continue;
            }

            if (! preg_match(
                '/\G-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/',
                $json,
                $matches,
                0,
                $index
            )) {
                ++$index;
                continue;
            }

            $token = $matches[0];
            $index += strlen($token);
            if (strpos($token, '.') !== false || stripos($token, 'e') !== false) {
                if (! is_finite((float) $token)) {
                    throw new InvalidJsonException(sprintf(
                        'JSON number %s is outside the finite PHP number range.',
                        $this->diagnosticToken($token)
                    ));
                }
                continue;
            }

            if (! $this->isNativeInteger($token)) {
                throw new InvalidJsonException(sprintf(
                    'JSON integer %s exceeds the native PHP integer range.',
                    $this->diagnosticToken($token)
                ));
            }
        }
    }

    private function diagnosticToken(string $token): string
    {
        if (strlen($token) > self::MAX_DIAGNOSTIC_TOKEN_LENGTH) {
            $token = substr($token, 0, self::MAX_DIAGNOSTIC_TOKEN_LENGTH) . '...';
        }

        return addcslashes($token, "\0..\37\177..\377");
    }

    private function isNativeInteger(string $token): bool
    {
        $negative = $token[0] === '-';
        $digits   = ltrim($token, '-');
        $digits   = ltrim($digits, '0');
        if ($digits === '') {
            return true;
        }

        $limit = $negative ? ltrim((string) PHP_INT_MIN, '-') : (string) PHP_INT_MAX;
        if (strlen($digits) !== strlen($limit)) {
            return strlen($digits) < strlen($limit);
        }

        return strcmp($digits, $limit) <= 0;
    }
}
