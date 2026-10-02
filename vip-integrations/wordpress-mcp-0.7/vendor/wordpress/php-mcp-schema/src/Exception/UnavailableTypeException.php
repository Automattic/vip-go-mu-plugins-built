<?php

declare(strict_types=1);

namespace WP\McpSchema\Exception;

final class UnavailableTypeException extends SchemaException
{
    public static function unsupportedRoot(string $class): self
    {
        return new self(sprintf('%s is not a supported schema construction root.', $class));
    }

    public static function forRevision(string $class, string $revision): self
    {
        return new self(sprintf('%s is not available in MCP revision %s.', $class, $revision));
    }
}
