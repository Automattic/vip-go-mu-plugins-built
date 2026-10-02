<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class LoggingMessageNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerNotification
{
    public const DEFINITION = 'LoggingMessageNotification';

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
     * @return 'notifications/message'
     */
    public function getMethod(): string
    {
        /** @var 'notifications/message' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\LoggingMessageNotificationParams
     */
    public function getParams(): \WP\McpSchema\Record\LoggingMessageNotificationParams
    {
        /** @var \WP\McpSchema\Record\LoggingMessageNotificationParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
