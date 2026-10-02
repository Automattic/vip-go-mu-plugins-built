<?php

declare(strict_types=1);

namespace WP\McpSchema\Exception;

final class UnsupportedRevisionException extends SchemaException
{
    /**
     * @param array<int, string> $supported
     */
    public static function forRevision(string $revision, array $supported): self
    {
        return new self(
            sprintf(
                'Unsupported MCP revision "%s". Supported revisions: %s.',
                $revision,
                implode(', ', $supported)
            )
        );
    }
}
