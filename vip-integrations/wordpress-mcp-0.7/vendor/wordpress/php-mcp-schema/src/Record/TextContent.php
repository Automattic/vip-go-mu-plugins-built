<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class TextContent extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ContentBlock, \WP\McpSchema\Contract\SamplingMessageContentBlock
{
    public const DEFINITION = 'TextContent';

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
    public function getText(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('text');

        return $value;
    }

    /**
     * @return 'text'
     */
    public function getType(): string
    {
        /** @var 'text' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
