<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ListToolsRequest extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientRequest
{
    public const DEFINITION = 'ListToolsRequest';

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
     * @return 'tools/list'
     */
    public function getMethod(): string
    {
        /** @var 'tools/list' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\PaginatedRequestParams|null
     */
    public function getParams(): ?\WP\McpSchema\Record\PaginatedRequestParams
    {
        /** @var \WP\McpSchema\Record\PaginatedRequestParams|null $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
