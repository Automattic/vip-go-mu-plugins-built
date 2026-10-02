<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class PaginatedRequest extends \WP\McpSchema\Record
{
    public const DEFINITION = 'PaginatedRequest';

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
     * @return string
     */
    public function getMethod(): string
    {
        /** @var string $value */
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
