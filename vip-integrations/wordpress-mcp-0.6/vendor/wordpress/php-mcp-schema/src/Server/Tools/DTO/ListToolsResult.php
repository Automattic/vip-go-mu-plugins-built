<?php

declare(strict_types=1);

namespace WP\McpSchema\Server\Tools\DTO;

use WP\McpSchema\Common\Protocol\DTO\PaginatedResult;
use WP\McpSchema\Common\Traits\ValidatesRequiredFields;
use WP\McpSchema\Server\Lifecycle\Union\ServerResultInterface;

/**
 * The server's response to a tools/list request from the client.
 *
 * @since 2024-11-05
 * @last-updated 2025-11-25 (modified property: tools)
 *
 * @mcp-domain Server
 * @mcp-subdomain Tools
 * @mcp-version 2025-11-25
 */
class ListToolsResult extends PaginatedResult implements ServerResultInterface
{
    use ValidatesRequiredFields;

    /**
     * Wire keys this class models. Anything else is kept in $additionalProperties.
     *
     * @var array<int, string>
     */
    private const KNOWN_KEYS = ['nextCursor', '_meta', 'tools'];

    /**
     * @since 2024-11-05
     *
     * @var array<\WP\McpSchema\Server\Tools\DTO\Tool>
     */
    protected array $tools;

    /**
     * @param array<\WP\McpSchema\Server\Tools\DTO\Tool> $tools @since 2024-11-05
     * @param string|null $nextCursor @since 2024-11-05
     * @param array<string, mixed>|null $_meta @since 2024-11-05
     * @param array<string, mixed>|null $additionalProperties
     */
    public function __construct(
        array $tools,
        ?string $nextCursor = null,
        ?array $_meta = null,
        ?array $additionalProperties = null
    ) {
        parent::__construct($_meta, $nextCursor, $additionalProperties);
        $this->tools = $tools;
    }

    /**
     * Creates an instance from an array.
     *
     * @param array{
     *     nextCursor?: string|null,
     *     _meta?: array<string, mixed>|null,
     *     tools: array<array<string, mixed>|\WP\McpSchema\Server\Tools\DTO\Tool>
     * } $data
     * @phpstan-param array<string, mixed> $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        self::assertRequired($data, ['tools']);

        /** @var array<\WP\McpSchema\Server\Tools\DTO\Tool> $tools */
        $tools = array_map(
            static fn($item) => is_array($item)
                ? Tool::fromArray($item)
                : $item,
            self::asArray($data['tools'])
        );

        return new self(
            $tools,
            self::asStringOrNull($data['nextCursor'] ?? null),
            self::asArrayOrNull($data['_meta'] ?? null),
            self::additionalFields($data, self::KNOWN_KEYS)
        );
    }

    /**
     * Converts the instance to an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $result = parent::toArray();

        $result['tools'] = array_map(static fn($item) => $item->toArray(), $this->tools);

        return $result;
    }

    /**
     * @return array<\WP\McpSchema\Server\Tools\DTO\Tool>
     */
    public function getTools(): array
    {
        return $this->tools;
    }
}
