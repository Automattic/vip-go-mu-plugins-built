<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class GetPromptResultResponse extends \WP\McpSchema\Record
{
    public const DEFINITION = 'GetPromptResultResponse';

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
     * @return \WP\McpSchema\Record\GetPromptResult|\WP\McpSchema\Record\InputRequiredResult
     */
    public function getResult()
    {
        /** @var \WP\McpSchema\Record\GetPromptResult|\WP\McpSchema\Record\InputRequiredResult $value */
        $value = $this->declaredValue('result');

        return $value;
    }
}
