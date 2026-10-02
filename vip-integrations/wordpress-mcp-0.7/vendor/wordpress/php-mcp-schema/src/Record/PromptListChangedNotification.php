<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class PromptListChangedNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerNotification
{
    public const DEFINITION = 'PromptListChangedNotification';

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
     * @return 'notifications/prompts/list_changed'
     */
    public function getMethod(): string
    {
        /** @var 'notifications/prompts/list_changed' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\NotificationParams|null
     */
    public function getParams(): ?\WP\McpSchema\Record\NotificationParams
    {
        /** @var \WP\McpSchema\Record\NotificationParams|null $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
