<?php

declare(strict_types=1);

namespace WP\McpSchema\Exception;

final class UnknownFieldException extends SchemaException
{
    public static function forField(string $recordClass, string $field): self
    {
        return new self(sprintf('Field "%s" is not declared or present on %s.', $field, $recordClass));
    }
}
