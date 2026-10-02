<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ProgressNotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ProgressNotificationParams';

    /**
     * @return \WP\McpSchema\Record\NotificationMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\NotificationMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getMessage(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('message');

        return $value;
    }

    /**
     * @return float|int
     */
    public function getProgress()
    {
        /** @var float|int $value */
        $value = $this->declaredValue('progress');

        return $value;
    }

    /**
     * @return float|int|string
     */
    public function getProgressToken()
    {
        /** @var float|int|string $value */
        $value = $this->declaredValue('progressToken');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getTotal()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('total');

        return $value;
    }
}
