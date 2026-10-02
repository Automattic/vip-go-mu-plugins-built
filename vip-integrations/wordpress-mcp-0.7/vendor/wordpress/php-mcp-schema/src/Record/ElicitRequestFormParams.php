<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ElicitRequestFormParams extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ElicitRequestParams
{
    public const DEFINITION = 'ElicitRequestFormParams';

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
     * @return string
     */
    public function getMessage(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('message');

        return $value;
    }

    /**
     * @return 'form'|null
     */
    public function getMode(): ?string
    {
        /** @var 'form'|null $value */
        $value = $this->declaredValue('mode');

        return $value;
    }

    /**
     * @return \stdClass
     */
    public function getRequestedSchema(): \stdClass
    {
        /** @var \stdClass $value */
        $value = $this->declaredValue('requestedSchema');

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
}
