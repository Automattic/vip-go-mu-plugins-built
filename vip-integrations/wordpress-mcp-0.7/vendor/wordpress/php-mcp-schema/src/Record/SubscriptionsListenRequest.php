<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscriptionsListenRequest extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientRequest
{
    public const DEFINITION = 'SubscriptionsListenRequest';

    /**
     * @return float|int|string
     */
    public function getId()
    {
        /** @var float|int|string $value */
        $value = $this->declaredValue('id');

        return $value;
    }

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
     * @return 'subscriptions/listen'
     */
    public function getMethod(): string
    {
        /** @var 'subscriptions/listen' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\SubscriptionsListenRequestParams
     */
    public function getParams(): \WP\McpSchema\Record\SubscriptionsListenRequestParams
    {
        /** @var \WP\McpSchema\Record\SubscriptionsListenRequestParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
