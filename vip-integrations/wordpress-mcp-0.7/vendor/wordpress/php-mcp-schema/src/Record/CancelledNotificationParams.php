<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CancelledNotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'CancelledNotificationParams';

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
    public function getReason(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('reason');

        return $value;
    }

    /**
     * @return float|int|null|string
     */
    public function getRequestId()
    {
        /** @var float|int|null|string $value */
        $value = $this->declaredValue('requestId');

        return $value;
    }
}
