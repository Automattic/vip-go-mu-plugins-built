<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class JSONRPCNotification extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\JSONRPCMessage
{
    public const DEFINITION = 'JSONRPCNotification';

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
     * @return string
     */
    public function getMethod(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getParams(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
