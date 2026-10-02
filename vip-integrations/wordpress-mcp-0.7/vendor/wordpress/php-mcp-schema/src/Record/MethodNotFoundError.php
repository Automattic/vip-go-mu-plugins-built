<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class MethodNotFoundError extends \WP\McpSchema\Record
{
    public const DEFINITION = 'MethodNotFoundError';

    /**
     * @return -32601
     */
    public function getCode()
    {
        /** @var -32601 $value */
        $value = $this->declaredValue('code');

        return $value;
    }

    /**
     * @return mixed|null
     */
    public function getData()
    {
        /** @var mixed|null $value */
        $value = $this->declaredValue('data');

        return $value;
    }

    /**
     * @return string
     */
    public function getMessage(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('message');

        return $value;
    }
}
