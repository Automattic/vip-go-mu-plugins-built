<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class NotificationMetaObject extends \WP\McpSchema\Record
{
    public const DEFINITION = 'NotificationMetaObject';

    /**
     * @return float|int|null|string
     */
    public function getIoModelcontextprotocolSubscriptionId()
    {
        /** @var float|int|null|string $value */
        $value = $this->declaredValue('io.modelcontextprotocol/subscriptionId');

        return $value;
    }
}
