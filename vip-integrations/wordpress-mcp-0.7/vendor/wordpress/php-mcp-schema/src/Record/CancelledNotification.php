<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CancelledNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientNotification, \WP\McpSchema\Contract\ServerNotification
{
    public const DEFINITION = 'CancelledNotification';

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
     * @return 'notifications/cancelled'
     */
    public function getMethod(): string
    {
        /** @var 'notifications/cancelled' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\CancelledNotificationParams
     */
    public function getParams(): \WP\McpSchema\Record\CancelledNotificationParams
    {
        /** @var \WP\McpSchema\Record\CancelledNotificationParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
