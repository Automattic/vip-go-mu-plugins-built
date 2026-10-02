<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class LoggingMessageNotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'LoggingMessageNotificationParams';

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
     * @return mixed
     */
    public function getData()
    {
        /** @var mixed $value */
        $value = $this->declaredValue('data');

        return $value;
    }

    /**
     * @return 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning'
     */
    public function getLevel(): string
    {
        /** @var 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning' $value */
        $value = $this->declaredValue('level');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getLogger(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('logger');

        return $value;
    }
}
