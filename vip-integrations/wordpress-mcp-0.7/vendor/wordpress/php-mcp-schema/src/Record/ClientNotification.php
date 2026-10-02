<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

/**
 * Canonical record available in: 2026-07-28.
 *
 * The same short name is also used by \WP\McpSchema\Contract\ClientNotification,
 * a canonical union construction root available in: 2025-11-25.
 */
final class ClientNotification extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ClientNotification';

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
