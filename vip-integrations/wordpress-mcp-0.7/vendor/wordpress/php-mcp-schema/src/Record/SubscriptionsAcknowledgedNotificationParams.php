<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscriptionsAcknowledgedNotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SubscriptionsAcknowledgedNotificationParams';

    /**
     * @return \WP\McpSchema\Record\NotificationMetaObject|null
     */
    public function getMeta(): ?\WP\McpSchema\Record\NotificationMetaObject
    {
        /** @var \WP\McpSchema\Record\NotificationMetaObject|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\SubscriptionFilter
     */
    public function getNotifications(): \WP\McpSchema\Record\SubscriptionFilter
    {
        /** @var \WP\McpSchema\Record\SubscriptionFilter $value */
        $value = $this->declaredValue('notifications');

        return $value;
    }
}
