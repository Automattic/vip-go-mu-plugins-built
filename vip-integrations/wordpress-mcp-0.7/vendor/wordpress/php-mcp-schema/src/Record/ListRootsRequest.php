<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ListRootsRequest extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\InputRequest, \WP\McpSchema\Contract\ServerRequest
{
    public const DEFINITION = 'ListRootsRequest';

    /**
     * Declared in: 2025-11-25.
     *
     * @return float|int|null|string
     */
    public function getId()
    {
        /** @var float|int|null|string $value */
        $value = $this->declaredValue('id');

        return $value;
    }

    /**
     * Declared in: 2025-11-25.
     *
     * @return '2.0'|null
     */
    public function getJsonrpc(): ?string
    {
        /** @var '2.0'|null $value */
        $value = $this->declaredValue('jsonrpc');

        return $value;
    }

    /**
     * @return 'roots/list'
     */
    public function getMethod(): string
    {
        /** @var 'roots/list' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\RequestParams|\stdClass|null
     */
    public function getParams()
    {
        /** @var \WP\McpSchema\Record\RequestParams|\stdClass|null $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
