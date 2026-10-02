<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ResourceUpdatedNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerNotification
{
    public const DEFINITION = 'ResourceUpdatedNotification';

    /**
     * @return '2.0'
     */
    public function getJsonrpc(): string
    {
        /** @var '2.0' $value */
        $value = $this->declaredValue('jsonrpc');

        return $value;
    }

    /**
     * @return 'notifications/resources/updated'
     */
    public function getMethod(): string
    {
        /** @var 'notifications/resources/updated' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\ResourceUpdatedNotificationParams
     */
    public function getParams(): \WP\McpSchema\Record\ResourceUpdatedNotificationParams
    {
        /** @var \WP\McpSchema\Record\ResourceUpdatedNotificationParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
