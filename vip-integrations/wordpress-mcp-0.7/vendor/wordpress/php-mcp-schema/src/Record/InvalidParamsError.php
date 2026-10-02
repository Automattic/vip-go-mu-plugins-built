<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class InvalidParamsError extends \WP\McpSchema\Record
{
    public const DEFINITION = 'InvalidParamsError';

    /**
     * @return -32602
     */
    public function getCode()
    {
        /** @var -32602 $value */
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
