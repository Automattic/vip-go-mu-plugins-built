<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ImageContent extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ContentBlock, \WP\McpSchema\Contract\SamplingMessageContentBlock
{
    public const DEFINITION = 'ImageContent';

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
     * @return \WP\McpSchema\Record\Annotations|null
     */
    public function getAnnotations(): ?\WP\McpSchema\Record\Annotations
    {
        /** @var \WP\McpSchema\Record\Annotations|null $value */
        $value = $this->declaredValue('annotations');

        return $value;
    }

    /**
     * @return string
     */
    public function getData(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('data');

        return $value;
    }

    /**
     * @return string
     */
    public function getMimeType(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('mimeType');

        return $value;
    }

    /**
     * @return 'image'
     */
    public function getType(): string
    {
        /** @var 'image' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
