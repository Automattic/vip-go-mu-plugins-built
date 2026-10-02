<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ElicitRequestURLParams extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ElicitRequestParams
{
    public const DEFINITION = 'ElicitRequestURLParams';

    /**
     * Declared in: 2025-11-25.
     *
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * Declared in: 2025-11-25.
     *
     * @return null|string
     */
    public function getElicitationId(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('elicitationId');

        return $value;
    }

    /**
     * @return string
     */
    public function getMessage(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('message');

        return $value;
    }

    /**
     * @return 'url'
     */
    public function getMode(): string
    {
        /** @var 'url' $value */
        $value = $this->declaredValue('mode');

        return $value;
    }

    /**
     * Declared in: 2025-11-25.
     *
     * @return \WP\McpSchema\Record\TaskMetadata|null
     */
    public function getTask(): ?\WP\McpSchema\Record\TaskMetadata
    {
        /** @var \WP\McpSchema\Record\TaskMetadata|null $value */
        $value = $this->declaredValue('task');

        return $value;
    }

    /**
     * @return string
     */
    public function getUrl(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('url');

        return $value;
    }
}
