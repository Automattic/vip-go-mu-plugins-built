<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class TaskStatusNotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'TaskStatusNotificationParams';

    /**
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
    public function getCreatedAt(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('createdAt');

        return $value;
    }

    /**
     * @return string
     */
    public function getLastUpdatedAt(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('lastUpdatedAt');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getPollInterval()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('pollInterval');

        return $value;
    }

    /**
     * @return 'cancelled'|'completed'|'failed'|'input_required'|'working'
     */
    public function getStatus(): string
    {
        /** @var 'cancelled'|'completed'|'failed'|'input_required'|'working' $value */
        $value = $this->declaredValue('status');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getStatusMessage(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('statusMessage');

        return $value;
    }

    /**
     * @return string
     */
    public function getTaskId(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('taskId');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getTtl()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('ttl');

        return $value;
    }
}
