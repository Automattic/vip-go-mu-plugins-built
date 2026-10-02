<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class JSONRPCResultResponse extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\JSONRPCMessage, \WP\McpSchema\Contract\JSONRPCResponse
{
    public const DEFINITION = 'JSONRPCResultResponse';

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
     * @return \WP\McpSchema\Record\Result
     */
    public function getResult(): \WP\McpSchema\Record\Result
    {
        /** @var \WP\McpSchema\Record\Result $value */
        $value = $this->declaredValue('result');

        return $value;
    }
}
