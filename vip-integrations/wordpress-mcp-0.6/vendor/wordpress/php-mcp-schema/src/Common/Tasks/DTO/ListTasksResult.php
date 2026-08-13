<?php

declare(strict_types=1);

namespace WP\McpSchema\Common\Tasks\DTO;

use WP\McpSchema\Client\Lifecycle\Union\ClientResultInterface;
use WP\McpSchema\Client\Tasks\DTO\Task;
use WP\McpSchema\Common\Protocol\DTO\PaginatedResult;
use WP\McpSchema\Common\Traits\ValidatesRequiredFields;
use WP\McpSchema\Server\Lifecycle\Union\ServerResultInterface;

/**
 * The response to a tasks/list request.
 *
 * @since 2025-11-25
 *
 * @mcp-domain Common
 * @mcp-subdomain Tasks
 * @mcp-version 2025-11-25
 */
class ListTasksResult extends PaginatedResult implements ClientResultInterface, ServerResultInterface
{
    use ValidatesRequiredFields;

    /**
     * Wire keys this class models. Anything else is kept in $additionalProperties.
     *
     * @var array<int, string>
     */
    private const KNOWN_KEYS = ['nextCursor', '_meta', 'tasks'];

    /**
     * @since 2025-11-25
     *
     * @var array<\WP\McpSchema\Client\Tasks\DTO\Task>
     */
    protected array $tasks;

    /**
     * @param array<\WP\McpSchema\Client\Tasks\DTO\Task> $tasks @since 2025-11-25
     * @param string|null $nextCursor @since 2025-11-25
     * @param array<string, mixed>|null $_meta @since 2025-11-25
     * @param array<string, mixed>|null $additionalProperties
     */
    public function __construct(
        array $tasks,
        ?string $nextCursor = null,
        ?array $_meta = null,
        ?array $additionalProperties = null
    ) {
        parent::__construct($_meta, $nextCursor, $additionalProperties);
        $this->tasks = $tasks;
    }

    /**
     * Creates an instance from an array.
     *
     * @param array{
     *     nextCursor?: string|null,
     *     _meta?: array<string, mixed>|null,
     *     tasks: array<array<string, mixed>|\WP\McpSchema\Client\Tasks\DTO\Task>
     * } $data
     * @phpstan-param array<string, mixed> $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        self::assertRequired($data, ['tasks']);

        /** @var array<\WP\McpSchema\Client\Tasks\DTO\Task> $tasks */
        $tasks = array_map(
            static fn($item) => is_array($item)
                ? Task::fromArray($item)
                : $item,
            self::asArray($data['tasks'])
        );

        return new self(
            $tasks,
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

        $result['tasks'] = array_map(static fn($item) => $item->toArray(), $this->tasks);

        return $result;
    }

    /**
     * @return array<\WP\McpSchema\Client\Tasks\DTO\Task>
     */
    public function getTasks(): array
    {
        return $this->tasks;
    }
}
