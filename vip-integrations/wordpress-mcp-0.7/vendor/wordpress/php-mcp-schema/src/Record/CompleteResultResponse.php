<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CompleteResultResponse extends \WP\McpSchema\Record
{
    public const DEFINITION = 'CompleteResultResponse';

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
     * @return \WP\McpSchema\Record\CompleteResult
     */
    public function getResult(): \WP\McpSchema\Record\CompleteResult
    {
        /** @var \WP\McpSchema\Record\CompleteResult $value */
        $value = $this->declaredValue('result');

        return $value;
    }
}
