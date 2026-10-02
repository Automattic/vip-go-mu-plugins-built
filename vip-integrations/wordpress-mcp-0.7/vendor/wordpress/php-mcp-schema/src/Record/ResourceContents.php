<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ResourceContents extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ResourceContents';

    /**
     * @return \WP\McpSchema\Record\MetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\MetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getMimeType(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('mimeType');

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
