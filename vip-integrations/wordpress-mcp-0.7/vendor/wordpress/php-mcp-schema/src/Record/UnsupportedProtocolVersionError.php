<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class UnsupportedProtocolVersionError extends \WP\McpSchema\Record
{
    public const DEFINITION = 'UnsupportedProtocolVersionError';

    /**
     * @return \WP\McpSchema\Record\Error
     */
    public function getError(): \WP\McpSchema\Record\Error
    {
        /** @var \WP\McpSchema\Record\Error $value */
        $value = $this->declaredValue('error');

        return $value;
    }

    /**
     * @return float|int|null|string
     */
    public function getId()
    {
        /** @var float|int|null|string $value */
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
}
