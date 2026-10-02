<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class Request extends \WP\McpSchema\Record
{
    public const DEFINITION = 'Request';

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
     * @return \stdClass|null
     */
    public function getParams(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
