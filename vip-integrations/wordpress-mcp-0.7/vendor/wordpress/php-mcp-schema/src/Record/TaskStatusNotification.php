<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class TaskStatusNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientNotification, \WP\McpSchema\Contract\ServerNotification
{
    public const DEFINITION = 'TaskStatusNotification';

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
     * @return 'notifications/tasks/status'
     */
    public function getMethod(): string
    {
        /** @var 'notifications/tasks/status' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\TaskStatusNotificationParams
     */
    public function getParams(): \WP\McpSchema\Record\TaskStatusNotificationParams
    {
        /** @var \WP\McpSchema\Record\TaskStatusNotificationParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
