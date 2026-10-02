<?php

declare(strict_types=1);

namespace WP\McpSchema\Exception;

final class ValidationException extends SchemaException
{
    private const MAX_DIAGNOSTIC_POINTER_SEGMENT_LENGTH = 80;

    /** @var string */
    private $pointer;

    public function __construct(string $pointer, string $message)
    {
        $this->pointer = $pointer;
        parent::__construct(sprintf('%s: %s', self::renderPointer($pointer), $message));
    }

    public function getPointer(): string
    {
        return $this->pointer;
    }

    private static function renderPointer(string $pointer): string
    {
        if ($pointer === '') {
            return '/';
        }

        $segments = explode('/', $pointer);
        foreach ($segments as $index => $segment) {
            $segment = str_replace(array('~1', '~0'), array('/', '~'), $segment);
            if (strlen($segment) > self::MAX_DIAGNOSTIC_POINTER_SEGMENT_LENGTH) {
                $segment = substr($segment, 0, self::MAX_DIAGNOSTIC_POINTER_SEGMENT_LENGTH) . '...';
            }
            $segment = addcslashes($segment, "\0..\37\177..\377");
            $segments[$index] = str_replace(array('~', '/'), array('~0', '~1'), $segment);
        }

        return implode('/', $segments);
    }
}
