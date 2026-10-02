<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ListResourcesResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'ListResourcesResult';

    /**
     * @return \WP\McpSchema\Record\ResultMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\ResultMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return 'private'|'public'|null
     */
    public function getCacheScope(): ?string
    {
        /** @var 'private'|'public'|null $value */
        $value = $this->declaredValue('cacheScope');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getNextCursor(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('nextCursor');

        return $value;
    }

    /**
     * @return array<int, \WP\McpSchema\Record\Resource>
     */
    public function getResources(): array
    {
        /** @var array<int, \WP\McpSchema\Record\Resource> $value */
        $value = $this->declaredValue('resources');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return null|string
     */
    public function getResultType(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('resultType');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return float|int|null
     */
    public function getTtlMs()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('ttlMs');

        return $value;
    }
}
