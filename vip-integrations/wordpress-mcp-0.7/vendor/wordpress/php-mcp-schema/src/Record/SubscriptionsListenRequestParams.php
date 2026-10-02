<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscriptionsListenRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SubscriptionsListenRequestParams';

    /**
     * @return \WP\McpSchema\Record\RequestMetaObject
     */
    public function getMeta(): \WP\McpSchema\Record\RequestMetaObject
    {
        /** @var \WP\McpSchema\Record\RequestMetaObject $value */
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
