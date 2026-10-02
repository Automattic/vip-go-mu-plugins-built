<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SetLevelRequest extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientRequest
{
    public const DEFINITION = 'SetLevelRequest';

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
     * @return 'logging/setLevel'
     */
    public function getMethod(): string
    {
        /** @var 'logging/setLevel' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\SetLevelRequestParams
     */
    public function getParams(): \WP\McpSchema\Record\SetLevelRequestParams
    {
        /** @var \WP\McpSchema\Record\SetLevelRequestParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
