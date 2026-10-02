<?php

declare(strict_types=1);

namespace WP\McpSchema\Exception;

/**
 * Base class for every failure raised by the schema runtime.
 *
 * Extends `\InvalidArgumentException` so that consumers, including the official
 * MCP PHP SDK, can map rejected input to a JSON-RPC invalid params error with
 * one catch clause.
 */
class SchemaException extends \InvalidArgumentException
{
}
