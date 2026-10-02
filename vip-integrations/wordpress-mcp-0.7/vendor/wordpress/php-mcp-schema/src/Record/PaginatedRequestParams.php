<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class PaginatedRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'PaginatedRequestParams';

    /**
     * @return \WP\McpSchema\Record\RequestMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\RequestMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getCursor(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('cursor');

        return $value;
    }
}
