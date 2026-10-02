<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscribeRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SubscribeRequestParams';

    /**
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return string
     */
    public function getUri(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('uri');

        return $value;
    }
}
